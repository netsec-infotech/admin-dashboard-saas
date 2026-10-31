/**
 * Evegah Environmental & CO2 Savings Estimation Engine
 * 
 * Baseline & Methodology:
 * - ICE 2-Wheeler (100-125cc petrol) baseline emissions: 95g CO2/km (0.095 kg/km) [ARAI / BEE standard]
 * - EV Scooter grid emission factor: ~25g CO2/km (based on 35 Wh/km @ 0.71 kg CO2/kWh Indian grid intensity)
 * - Net Avoided CO2 Factor: 70g CO2/km (0.070 kg/km) net, or 95g CO2/km (0.095 kg/km) gross tailpipe avoidance.
 * - Standard EPA/IPCC annual tree carbon sequestration factor: 21.77 kg CO2/year per mature tree.
 * - Standard petrol 2-wheeler fuel efficiency: 42.0 km / litre.
 * - Current petrol price baseline: ₹101.50 per litre.
 * - Average daily passenger car emission: ~4.6 kg CO2/day.
 * - AQI PM2.5/PM10 emission avoidance: ~0.05 grams/km.
 */

const ENVIRONMENTAL_CONFIG = {
  // Gross tailpipe CO2 emission avoided per km (kg)
  ICE_CO2_PER_KM_KG: parseFloat(process.env.CO2_PER_KM_KG) || 0.095,
  
  // Net lifecycle CO2 emission avoided per km considering grid charging (kg)
  NET_CO2_PER_KM_KG: parseFloat(process.env.NET_CO2_PER_KM_KG) || 0.070,

  // Annual CO2 absorbed by one mature tree (kg/year)
  TREE_ABSORPTION_KG_YEAR: 21.77,

  // Average petrol mileage for 100-125cc two-wheelers (km/litre)
  PETROL_KM_PER_LITRE: 42.0,

  // Average petrol fuel cost (INR/litre)
  PETROL_COST_PER_LITRE: 101.50,

  // Average daily passenger car tailpipe emissions (kg CO2/day)
  CAR_DAILY_CO2_KG: 4.6,

  // Particulate matter (PM2.5/PM10) avoided per km (grams)
  AQI_PM_AVOIDED_GRAMS_KM: 0.05,
};

/**
 * Calculate comprehensive environmental ESG metrics from verified driven distance
 * @param {number} distanceKm Total verified distance in kilometers
 * @param {boolean} useNet Whether to use net lifecycle or gross tailpipe factor
 */
function calculateEnvironmentalSavings(distanceKm, useNet = false) {
  const km = Math.max(0, parseFloat(distanceKm) || 0);
  const co2Factor = useNet 
    ? ENVIRONMENTAL_CONFIG.NET_CO2_PER_KM_KG 
    : ENVIRONMENTAL_CONFIG.ICE_CO2_PER_KM_KG;

  const totalCo2SavedKg = Math.round(km * co2Factor * 10) / 10;
  const fuelAvoidedLitres = Math.round(km / ENVIRONMENTAL_CONFIG.PETROL_KM_PER_LITRE);
  const fuelCostSavedInr = Math.round(fuelAvoidedLitres * ENVIRONMENTAL_CONFIG.PETROL_COST_PER_LITRE);
  const treesEquivalent = Math.max(0, Math.round(totalCo2SavedKg / ENVIRONMENTAL_CONFIG.TREE_ABSORPTION_KG_YEAR));
  const carsOffRoad = Math.max(0, Math.round(totalCo2SavedKg / ENVIRONMENTAL_CONFIG.CAR_DAILY_CO2_KG));
  const carbonCreditsTonnes = parseFloat((totalCo2SavedKg / 1000).toFixed(4));
  const aqiPmAvoidedGrams = Math.round(km * ENVIRONMENTAL_CONFIG.AQI_PM_AVOIDED_GRAMS_KM);

  return {
    distanceKm: Math.round(km * 10) / 10,
    totalCo2SavedKg,
    fuelAvoidedLitres,
    fuelCostSavedInr,
    treesEquivalent,
    carsOffRoad,
    carbonCreditsTonnes,
    aqiPmAvoidedGrams,
    factors: {
      co2PerKmKg: co2Factor,
      treeAbsorptionKgYear: ENVIRONMENTAL_CONFIG.TREE_ABSORPTION_KG_YEAR,
      petrolKmPerLitre: ENVIRONMENTAL_CONFIG.PETROL_KM_PER_LITRE,
    },
    methodology: {
      standard: 'ARAI / BEE & EPA Sequestration Standards',
      factor_ice_co2_kg_per_km: co2Factor,
      tree_absorption_kg_year: ENVIRONMENTAL_CONFIG.TREE_ABSORPTION_KG_YEAR,
      petrol_km_per_litre: ENVIRONMENTAL_CONFIG.PETROL_KM_PER_LITRE,
      petrol_cost_per_litre: ENVIRONMENTAL_CONFIG.PETROL_COST_PER_LITRE
    }
  };
}

module.exports = {
  ENVIRONMENTAL_CONFIG,
  calculateEnvironmentalSavings,
};
