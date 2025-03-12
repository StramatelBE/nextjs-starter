const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000/api/';
const APP_USERNAME = process.env.APP_USERNAME || 'tempuser';
const APP_PASSWORD = process.env.APP_PASSWORD || 'password';
let token = null;

// List of known I2C addresses for temperature sensors
const KNOWN_ADDRESSES = [0x48, 0x49, 0x4A, 0x4B];
let lm92_address = null;

// Login to get authentication token
async function getAuthToken() {
    try {
        const response = await fetch(`${API_URL}auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: APP_USERNAME,
                password: APP_PASSWORD,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to login: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

// Update temperature in the database
async function updateTemperature(temp) {
    try {
        if (!token) {
            token = await getAuthToken();
            if (!token) {
                console.error('No token available, cannot update temperature');
                return;
            }
        }

        const response = await fetch(`${API_URL}data/1`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: temp,
            }),
        });

        if (response.ok) {
            console.log(`Temperature updated successfully: ${temp}`);
        } else {
            if (response.status === 401) {
                // Token expired, get a new one
                token = null;
                await updateTemperature(temp);
            } else {
                console.error(`Failed to update temperature: ${response.status} ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error(`Error updating temperature: ${error}`);
    }
}

// Find I2C addresses on the bus
function findI2CAddress() {
    return new Promise((resolve) => {
        try {
            const i2cdetect = spawn('i2cdetect', ['-y', '1']);
            let output = '';

            i2cdetect.stdout.on('data', (data) => {
                output += data.toString();
            });

            i2cdetect.on('close', () => {
                const addresses = [];
                const lines = output.split('\n');

                for (const line of lines) {
                    const matches = line.match(/\b[0-9a-fA-F]{2}\b/g);
                    if (matches) {
                        for (const match of matches) {
                            if (match !== 'UU') {
                                addresses.push(parseInt(match, 16));
                            }
                        }
                    }
                }

                console.log(`I2C Addresses found: ${addresses.join(', ')}`);
                resolve(addresses);
            });

            i2cdetect.on('error', (err) => {
                console.error(`Error executing i2cdetect: ${err}`);
                resolve([]);
            });
        } catch (error) {
            console.error(`Failed to find I2C addresses: ${error}`);
            resolve([]);
        }
    });
}

// Read temperature from sensor
function readTemperature() {
    return new Promise((resolve) => {
        if (!lm92_address) {
            resolve('---');
            return;
        }

        try {
            const i2cget = spawn('i2cget', ['-y', '1', lm92_address.toString(16), '0', 'w']);
            let output = '';

            i2cget.stdout.on('data', (data) => {
                output += data.toString().trim();
            });

            i2cget.on('close', () => {
                try {
                    // Parse the raw temperature data
                    let rawTemp = parseInt(output, 16);
                    rawTemp = rawTemp >> 3;

                    if (rawTemp & 0x1000) {
                        rawTemp = rawTemp - 8192;
                    }

                    const temperature = Math.ceil(rawTemp * 0.0625);
                    resolve(temperature.toString());
                } catch (err) {
                    console.error(`Error parsing temperature: ${err}`);
                    resolve('---');
                }
            });

            i2cget.on('error', (err) => {
                console.error(`Error reading temperature: ${err}`);
                resolve('---');
            });
        } catch (error) {
            console.error(`Failed to read temperature: ${error}`);
            resolve('---');
        }
    });
}

// Main loop
async function main() {
    while (true) {
        const addresses = await findI2CAddress();

        if (!lm92_address) {
            for (const addr of addresses) {
                if (KNOWN_ADDRESSES.includes(addr)) {
                    lm92_address = addr;
                    break;
                }
            }

            if (!lm92_address) {
                console.log('LM92 sensor not found on I2C bus, will retry in 10 seconds...');
                await updateTemperature('---');
            }
        } else {
            const temp = await readTemperature();
            console.log(`Temperature: ${temp}°C`);
            await updateTemperature(temp);
        }

        // Sleep for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

// Start the service
main().catch(error => {
    console.error(`Temperature service error: ${error}`);
    process.exit(1);
});