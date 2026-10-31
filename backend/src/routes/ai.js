const express = require('express');
const router = express.Router();
const db = require('../db');
const https = require('https');

function callGeminiAPI(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(data));
    req.end();
  });
}

router.post('/automate', async (req, res) => {
  const geminiKey = req.headers['x-gemini-key'] || req.body.geminiKey;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ status: 'error', message: 'Prompt is required' });
  }

  if (!geminiKey) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Gemini API Key is required. Please click the Settings icon in the Chatbox header to configure it.' 
    });
  }

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
    
    const systemInstruction = `
      You are Evegah AI Assistant. Your task is to analyze the user's natural language request and map it to a structured JSON object representing dashboard operations: adding vehicles, assigning zones to entities, and configuring zone pricing.
      
      You must respond ONLY with a valid JSON block containing:
      {
        "intent": "ADD_VEHICLE" | "ASSIGN_ZONE" | "CREATE_ZONE_PRICING" | "CHITCHAT",
        "parameters": {
          // For ADD_VEHICLE:
          "vehicleNumber": string (e.g. EVM-101, etc.),
          "evegahModelName": "Evegah Mink" | "Evegah City" | "Evegah Fly" | "Evegah Pro",
          "vehicleCategory": "E-Scooter" | "E-Bike" | "E-Moped" | "E-Cycle",
          "zoneName": string (target zone name, optional),
          "vehicleStatus": "Available" | "Maintenance" | "Out of Service",
          
          // For ASSIGN_ZONE:
          "entityType": "vehicle" | "user" | "battery",
          "entityId": string (e.g. vehicle code/id, user email/name/id, battery serial/id),
          "zoneName": string,
          
          // For CREATE_ZONE_PRICING:
          "zoneName": string,
          "pricingModel": "Hourly Based" | "Package Based",
          "basePrice": number (optional),
          "extraPrice": number (optional),
          "notes": string (optional)
        },
        "responseMessage": string (a polite, friendly message to show to the user explaining what you are about to do or answering their chitchat query)
      }
    `;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `System Instruction: ${systemInstruction}\n\nUser Request: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const geminiData = await callGeminiAPI(geminiUrl, payload);
    const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      throw new Error("No response content from Gemini API.");
    }

    let resultObj;
    try {
      resultObj = JSON.parse(replyText.trim());
    } catch (e) {
      throw new Error(`Failed to parse Gemini response as JSON: ${replyText}`);
    }

    const { intent, parameters, responseMessage } = resultObj;

    let executionDetail = '';
    let success = true;

    if (intent === 'ADD_VEHICLE') {
      const { vehicleNumber, evegahModelName, vehicleCategory, zoneName, vehicleStatus } = parameters;
      if (!vehicleNumber) {
        success = false;
        executionDetail = 'Could not determine the vehicle number code from your request.';
      } else {
        const evegahModelNameVal = evegahModelName || 'Evegah City';
        let img = '/City-1.png';
        if (evegahModelNameVal.toLowerCase().includes('mink')) img = '/Mink-1.png';
        else if (evegahModelNameVal.toLowerCase().includes('fly')) img = '/fly-1.png';
        else if (evegahModelNameVal.toLowerCase().includes('pro')) img = '/pro-1.png';

        const result = await db.query(`
          INSERT INTO vehicles (
            code, vehicle_image, vehicle_category, vehicle_type, evegah_model_name,
            vehicle_status, status, battery_pct, speed, renter_name, zone
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `, [
          vehicleNumber,
          img,
          vehicleCategory || 'E-Scooter',
          'Rental',
          evegahModelNameVal,
          vehicleStatus || 'Available',
          'Online',
          100,
          0,
          'None (Available)',
          zoneName || 'Unassigned'
        ]);
        executionDetail = `Added vehicle ${vehicleNumber} (${evegahModelNameVal}) successfully to zone "${zoneName || 'Unassigned'}".`;
      }
    } 
    else if (intent === 'ASSIGN_ZONE') {
      const { entityType, entityId, zoneName } = parameters;
      if (!entityType || !entityId || !zoneName) {
        success = false;
        executionDetail = 'Required parameters for zone assignment (entityType, entityId, zoneName) are missing.';
      } else {
        const zoneCheck = await db.query('SELECT * FROM zones WHERE name = $1', [zoneName]);
        if (zoneCheck.rows.length === 0) {
          success = false;
          executionDetail = `Zone "${zoneName}" does not exist in the database. Please create it first.`;
        } else {
          if (entityType === 'vehicle') {
            const res = await db.query(
              'UPDATE vehicles SET zone = $1 WHERE code = $2 OR id::text = $2 RETURNING *',
              [zoneName, entityId]
            );
            if (res.rows.length > 0) {
              executionDetail = `Successfully assigned vehicle ${entityId} to zone "${zoneName}".`;
            } else {
              success = false;
              executionDetail = `Vehicle "${entityId}" not found in database.`;
            }
          } else if (entityType === 'user') {
            const res = await db.query(
              'UPDATE users SET zone = $1 WHERE email = $2 OR name = $2 OR id::text = $2 RETURNING *',
              [zoneName, entityId]
            );
            if (res.rows.length > 0) {
              executionDetail = `Successfully assigned user "${res.rows[0].name}" to zone "${zoneName}".`;
            } else {
              success = false;
              executionDetail = `User "${entityId}" not found in database.`;
            }
          } else if (entityType === 'battery') {
            const res = await db.query(
              'UPDATE batteries SET zone = $1 WHERE serial_number = $2 OR battery_id = $2 RETURNING *',
              [zoneName, entityId]
            );
            if (res.rows.length > 0) {
              executionDetail = `Successfully assigned battery "${entityId}" to zone "${zoneName}".`;
            } else {
              success = false;
              executionDetail = `Battery "${entityId}" not found in database.`;
            }
          }
        }
      }
    }
    else if (intent === 'CREATE_ZONE_PRICING') {
      const { zoneName, pricingModel, basePrice, extraPrice, notes } = parameters;
      if (!zoneName || !pricingModel) {
        success = false;
        executionDetail = 'Required parameters for zone pricing (zoneName, pricingModel) are missing.';
      } else {
        const zoneCheck = await db.query('SELECT * FROM zones WHERE name = $1', [zoneName]);
        if (zoneCheck.rows.length === 0) {
          success = false;
          executionDetail = `Zone "${zoneName}" not found.`;
        } else {
          const pricingObj = {
            pricingModel,
            notes: notes || '',
            basePrice: basePrice || (pricingModel === 'Hourly Based' ? 100 : null),
            extraPrice: extraPrice || (pricingModel === 'Hourly Based' ? 10 : null),
            hourlyPricing: pricingModel === 'Hourly Based' ? [
              { id: 1, model: 'Evegah MINK', basePrice: basePrice || 100, extraPrice: extraPrice || 10, gracePeriod: '0', roundingRule: 'Per 15 Minutes', deposit: 500 },
              { id: 2, model: 'Evegah CITY', basePrice: basePrice || 100, extraPrice: extraPrice || 10, gracePeriod: '0', roundingRule: 'Per 15 Minutes', deposit: 500 }
            ] : [],
            packages: []
          };
          
          await db.query(
            'UPDATE zones SET pricing = $1 WHERE name = $2',
            [JSON.stringify(pricingObj), zoneName]
          );
          executionDetail = `Configured pricing for zone "${zoneName}" to ${pricingModel} successfully.`;
        }
      }
    }

    res.json({
      status: 'success',
      intent,
      reply: responseMessage || executionDetail,
      executionDetail,
      success
    });

  } catch (err) {
    console.error('AI Automate Error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'An unexpected error occurred during AI execution.'
    });
  }
});

module.exports = router;
