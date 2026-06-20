/**
 * EcoTrack - Carbon Footprint Formula Utilities
 * All coefficients represent kg CO2 equivalent per unit.
 */

const EMISSION_FACTORS = {
    transport: {
        petrol_car: 0.18,      // per km
        diesel_car: 0.17,      // per km
        electric_car: 0.05,    // per km
        public_transit: 0.04,  // per km
        active: 0.00           // per km (bike/walk)
    },
    energy: {
        electricity: 0.38,     // per kWh
        gas: 0.18,             // per kWh
        water: 0.30            // per m3 (1000 Liters)
    },
    food: {
        meat_heavy: 8.2,       // per day
        balanced: 5.2,         // per day
        vegetarian: 3.2,       // per day
        vegan: 2.1             // per day
    },
    waste: {
        general_waste: 1.20    // per kg (recycled portion reduces this)
    }
};

/**
 * Calculates emissions for a transportation activity.
 * @param {string} mode - Mode of transport (petrol_car, diesel_car, electric_car, public_transit, active)
 * @param {number} distance - Distance in kilometers
 * @returns {number} kg CO2
 */
function calculateTransport(mode, distance) {
    const factor = EMISSION_FACTORS.transport[mode] || 0;
    return Number((distance * factor).toFixed(2));
}

/**
 * Calculates emissions for household energy consumption.
 * @param {number} electricity - kWh of electricity used
 * @param {number} gas - kWh of natural gas used
 * @param {number} water - cubic meters (m3) of water used
 * @returns {number} kg CO2
 */
function calculateEnergy(electricity, gas, water) {
    const electricityEmissions = electricity * EMISSION_FACTORS.energy.electricity;
    const gasEmissions = gas * EMISSION_FACTORS.energy.gas;
    const waterEmissions = water * EMISSION_FACTORS.energy.water;
    return Number((electricityEmissions + gasEmissions + waterEmissions).toFixed(2));
}

/**
 * Calculates daily food emissions based on diet category.
 * @param {string} dietType - Diet category (meat_heavy, balanced, vegetarian, vegan)
 * @returns {number} kg CO2
 */
function calculateFood(dietType) {
    const factor = EMISSION_FACTORS.food[dietType] || EMISSION_FACTORS.food.balanced;
    return Number(factor.toFixed(2));
}

/**
 * Calculates daily waste emissions.
 * @param {number} weight - Waste weight in kg
 * @param {number} recyclingPercentage - Recycled or composted percentage (0 to 100)
 * @returns {number} kg CO2
 */
function calculateWaste(weight, recyclingPercentage) {
    const recyclingFactor = 1 - (Math.min(100, Math.max(0, recyclingPercentage)) / 100);
    const emissions = weight * EMISSION_FACTORS.waste.general_waste * recyclingFactor;
    return Number(emissions.toFixed(2));
}

/**
 * Generates suggestions based on high emissions categories.
 * @param {Object} averages - Average emissions by category { transport, energy, food, waste }
 * @returns {Array<Object>} List of personalized suggestions
 */
function getSuggestions(averages) {
    const suggestions = [];
    
    // Thresholds for warning/suggestions (based on standard daily targets)
    const THRESHOLDS = {
        transport: 3.5, // ~20 km in a normal petrol car
        energy: 4.5,    // ~10 kWh electricity + some gas/water
        food: 4.5,      // balanced/meat-heavy diet average
        waste: 1.0      // ~1 kg of waste
    };

    if (averages.transport > THRESHOLDS.transport) {
        suggestions.push({
            id: 's_transport_1',
            category: 'transport',
            title: 'Opt for public transit or active travel',
            desc: `Your transport emissions average ${averages.transport.toFixed(1)} kg CO2 daily. Swapping just 2 car trips a week for public transport or biking could save up to 150 kg of CO2 annually.`,
            impact: 'High',
            action: 'Log active transport or public transit tomorrow.'
        });
    }

    if (averages.energy > THRESHOLDS.energy) {
        suggestions.push({
            id: 's_energy_1',
            category: 'energy',
            title: 'Optimize home heating and electronics',
            desc: `Your daily energy usage produces ${averages.energy.toFixed(1)} kg CO2. Turn off appliances at the wall (saves up to 10% standby energy) and lower your thermostat by 1°C.`,
            impact: 'High',
            action: 'Do a walk-through and unplug standby electronics tonight.'
        });
    }

    if (averages.food > THRESHOLDS.food) {
        suggestions.push({
            id: 's_food_1',
            category: 'food',
            title: 'Introduce plant-based days',
            desc: `Your food carbon footprint averages ${averages.food.toFixed(1)} kg CO2. Replacing meat with lentils, beans, or vegetables just one day a week reduces food-related emissions by 15%.`,
            impact: 'Medium',
            action: 'Plan a meat-free day (e.g., Meatless Monday).'
        });
    }

    if (averages.waste > THRESHOLDS.waste) {
        suggestions.push({
            id: 's_waste_1',
            category: 'waste',
            title: 'Improve household recycling rate',
            desc: `You average ${averages.waste.toFixed(1)} kg CO2 daily in landfill waste. Set up separate recycling and composting bins to redirect up to 80% of waste away from landfills.`,
            impact: 'Medium',
            action: 'Sort and compost organic scraps today.'
        });
    }

    // Default suggestions if user is doing very well overall
    if (suggestions.length === 0) {
        suggestions.push({
            id: 's_general_1',
            category: 'food',
            title: 'Support local and seasonal products',
            desc: 'Excellent job keeping your footprint low! You can reduce impact further by choosing local and seasonal ingredients, which minimizes transit emissions (food miles).',
            impact: 'Low',
            action: 'Purchase food items from local farmers markets.'
        });
        suggestions.push({
            id: 's_general_2',
            category: 'energy',
            title: 'Switch to a 100% renewable electricity tariff',
            desc: 'Your direct energy footprint is clean, but switching your home energy provider to a certified green energy supplier cuts your carbon footprint at the source.',
            impact: 'High',
            action: 'Research green electricity tariffs in your area.'
        });
    }

    return suggestions;
}
