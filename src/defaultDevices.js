const Device = require("./models/Device");

const setDefaultDevices = async () => {
  const device = await Device.find();

  if (device && device.length > 0) return;

  return await Device.insertMany([
    {
      name: "iPhone",
      models: [
        {
          name: "iPhone 11",
          storages: [
            { name: "64gb", price: 170 },
            { name: "128gb", price: 200 },
          ],
          colors: [
            { name: "Black" },
            { name: "White" },
            { name: "Yellow" },
            { name: "Green" },
            { name: "Purple" },
            { name: "Red" },
          ],
        },
        {
          name: "iPhone 12",
          storages: [
            { name: "64gb", price: 200 },
            { name: "128gb", price: 250 },
          ],
          colors: [
            { name: "Black" },
            { name: "White" },
            { name: "Red" },
            { name: "Green" },
            { name: "Blue" },
            { name: "Purple" },
          ],
        },
        {
          name: "iPhone 12 pro",
          storages: [
            { name: "128gb", price: 300 },
            { name: "256gb", price: 320 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Graphite" },
            { name: "Gold" },
            { name: "Pacific Blue" },
          ],
        },
        {
          name: "iPhone 12 pro max",
          storages: [
            { name: "128gb", price: 330 },
            { name: "256gb", price: 360 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Graphite" },
            { name: "Gold" },
            { name: "Pacific Blue" },
          ],
        },
        {
          name: "iPhone 13",
          storages: [
            { name: "128gb", price: 300 },
            { name: "256gb", price: 340 },
          ],
          colors: [
            { name: "Red" },
            { name: "Starlight" },
            { name: "Midnight" },
            { name: "Blue" },
            { name: "Pink" },
            { name: "Green" },
          ],
        },
        {
          name: "iPhone 13 pro",
          storages: [
            { name: "128gb", price: 400 },
            { name: "256gb", price: 420 },
            { name: "512gb", price: 450 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Graphite" },
            { name: "Gold" },
            { name: "Sierra Blue" },
            { name: "Alpine Green" },
          ],
        },
        {
          name: "iPhone 13 pro max",
          storages: [
            { name: "128gb", price: 450 },
            { name: "256gb", price: 500 },
            { name: "512gb", price: 530 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Graphite" },
            { name: "Gold" },
            { name: "Sierra Blue" },
            { name: "Alpine Green" },
          ],
        },
        {
          name: "iPhone 14",
          storages: [
            { name: "128gb", price: 350 },
            { name: "256gb", price: 380 },
          ],
          colors: [
            { name: "Yellow" },
            { name: "Purple" },
            { name: "Midnight" },
            { name: "Starlight" },
            { name: "Blue" },
            { name: "Red" },
          ],
        },
        {
          name: "iPhone 14 pro",
          storages: [
            { name: "128gb", price: 500 },
            { name: "256gb", price: 540 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Gold" },
            { name: "Space Black" },
            { name: "Deep Purple" },
          ],
        },
        {
          name: "iPhone 14 pro max",
          storages: [
            { name: "128gb", price: 550 },
            { name: "256gb", price: 600 },
            { name: "512gb", price: 640 },
          ],
          colors: [
            { name: "Silver" },
            { name: "Gold" },
            { name: "Space Black" },
            { name: "Deep Purple" },
          ],
        },
        {
          name: "iPhone 15",
          storages: [
            { name: "128gb", price: 450 },
            { name: "256gb", price: 480 },
          ],
          colors: [
            { name: "Black" },
            { name: "Blue" },
            { name: "Green" },
            { name: "Yellow" },
            { name: "Pink" },
          ],
        },
        {
          name: "iPhone 15 pro",
          storages: [
            { name: "128gb", price: 650 },
            { name: "256gb", price: 700 },
            { name: "512gb", price: 750 },
          ],
          colors: [
            { name: "Black Titanium" },
            { name: "White Titanium" },
            { name: "Blue Titanium" },
            { name: "Natural Titanium" },
          ],
        },
        {
          name: "iPhone 15 pro max",
          storages: [
            { name: "256gb", price: 750 },
            { name: "512gb", price: 830 },
            { name: "1Tb", price: 870 },
          ],
          colors: [
            { name: "Black Titanium" },
            { name: "White Titanium" },
            { name: "Blue Titanium" },
            { name: "Natural Titanium" },
          ],
        },
        {
          name: "iPhone 16",
          storages: [
            { name: "128gb", price: 670 },
            { name: "256gb", price: 750 },
          ],
          colors: [
            { name: "Black" },
            { name: "White" },
            { name: "Pink" },
            { name: "Ultramarine" },
            { name: "Teal" },
          ],
        },
        {
          name: "iPhone 16 pro",
          storages: [
            { name: "128gb", price: 850 },
            { name: "256gb", price: 950 },
            { name: "512gb", price: 1100 },
          ],
          colors: [
            { name: "Black Titanium" },
            { name: "White Titanium" },
            { name: "Desert Titanium" },
            { name: "Natural Titanium" },
          ],
        },
        {
          name: "iPhone 16 pro max",
          storages: [
            { name: "256gb", price: 1050 },
            { name: "512gb", price: 1230 },
            { name: "1Tb", price: 1350 },
          ],
          colors: [
            { name: "Black Titanium" },
            { name: "White Titanium" },
            { name: "Desert Titanium" },
            { name: "Natural Titanium" },
          ],
        },
      ],
      deductions: {
        battery: [
          { name: "90-100%", percent: 5 },
          { name: "80-90%", percent: 10 },
          { name: "70-80%", percent: 15 },
        ],
        screen: [
          { name: "0-10%", percent: 3 },
          { name: "10-20%", percent: 7 },
          { name: "20-30%", percent: 10 },
          { name: "30-100%", percent: 15 },
        ],
        appearance: [
          { name: "90-100%", percent: 3 },
          { name: "80-90%", percent: 7 },
          { name: "70-80%", percent: 10 },
        ],
        accessories: { box: 50, cable: 10 },
        sims: [{ name: "E-sim" }, { name: "1-sim" }, { name: "Dual-sim" }],
      },
    },
    {
      name: "MacBook",
      models: [
        {
          name: "Macbook Air M1 13.3",
          storages: [{ name: "8/256gb", price: 450 }],
          colors: [
            { name: "Space Gray" },
            { name: "Silver" },
            { name: "Gold" },
          ],
        },
        {
          name: "Macbook Air M2 13.6",
          storages: [
            { name: "8/256gb", price: 600 },
            { name: "8/512gb", price: 700 },
            { name: "16/256gb", price: 650 },
          ],
          colors: [
            { name: "Midnight" },
            { name: "Starlight" },
            { name: "Space Gray" },
            { name: "Silver" },
          ],
        },
        {
          name: "Macbook Air M3 13.6",
          storages: [
            { name: "8/256gb", price: 750 },
            { name: "8/512gb", price: 850 },
            { name: "16/256gb", price: 750 },
            { name: "16/512gb", price: 950 },
            { name: "24/512gb", price: 1000 },
          ],
          colors: [
            { name: "Midnight" },
            { name: "Starlight" },
            { name: "Space Gray" },
            { name: "Silver" },
          ],
        },
        {
          name: "Macbook Air M3 15",
          storages: [
            { name: "8/256gb", price: 900 },
            { name: "8/512gb", price: 1000 },
            { name: "16/256gb", price: 1000 },
            { name: "16/512gb", price: 1100 },
            { name: "24/512gb", price: 1200 },
          ],
          colors: [
            { name: "Midnight" },
            { name: "Starlight" },
            { name: "Space Gray" },
            { name: "Silver" },
          ],
        },
      ],
      deductions: {
        battery: [
          { name: "0-50", percent: 15 },
          { name: "50-100", percent: 20 },
          { name: "100-150", percent: 30 },
          { name: "150+", percent: 40 },
        ],
        screen: [
          { name: "0-30%", price: 50 },
          { name: "30-100%", price: 100 },
        ],
        accessories: { box: 80 },
        appearance: [
          { name: "80-100%", price: 50 },
          { name: "60-80%", price: 120 },
          { name: "0-60%", price: 999999 },
        ],
      },
    },
    {
      name: "iPad",
      models: [
        {
          name: "iPad 9",
          storages: [
            { name: "64gb sim", price: 250 },
            { name: "64gb wifi", price: 150 },
            { name: "256gb sim", price: 450 },
            { name: "256gb wifi", price: 250 },
          ],
          colors: [{ name: "Silver" }, { name: "Space Gray" }],
        },
        {
          name: "iPad 10",
          storages: [
            { name: "64gb sim", price: 300 },
            { name: "64gb wifi", price: 150 },
            { name: "256gb sim", price: 500 },
            { name: "256gb wifi", price: 300 },
          ],
          colors: [
            { name: "Blue" },
            { name: "Pink" },
            { name: "Silver" },
            { name: "Yellow" },
          ],
        },
        {
          name: "iPad Air 5",
          storages: [
            { name: "64gb sim", price: 400 },
            { name: "64gb wifi", price: 250 },
            { name: "256gb wifi", price: 400 },
          ],
          colors: [
            { name: "Blue" },
            { name: "Pink" },
            { name: "Purple" },
            { name: "Space Gray" },
            { name: "Starlight" },
          ],
        },
        {
          name: "iPad Mini 6",
          storages: [
            { name: "64gb sim", price: 300 },
            { name: "64gb wifi", price: 200 },
            { name: "256gb sim", price: 400 },
            { name: "256gb wifi", price: 300 },
          ],
          colors: [
            { name: "Purple" },
            { name: "Pink" },
            { name: "Starlight" },
            { name: "Space Gray" },
          ],
        },
        {
          name: "iPad Pro 11 M2",
          storages: [
            { name: "256gb sim", price: 500 },
            { name: "256gb wifi", price: 400 },
            { name: "512gb sim", price: 650 },
            { name: "512gb wifi", price: 450 },
            { name: "1TB", price: 700 },
          ],
          colors: [{ name: "Silver" }, { name: "Space Gray" }],
        },
      ],
      deductions: {
        battery: [
          { name: "90-100%", percent: 5 },
          { name: "80-90%", percent: 10 },
          { name: "70-80%", percent: 15 },
        ],
        screen: [
          { name: "0-30%", price: 50 },
          { name: "30-100%", price: 100 },
        ],
        appearance: [
          { name: "80-100%", price: 50 },
          { name: "60-80%", price: 120 },
          { name: "0-60%", price: 999999 },
        ],
        accessories: { box: 80 },
      },
    },
    {
      name: "iWatch",
      models: [
        {
          name: "iWatch SE 2022",
          sizes: [
            { name: "40mm", price: 140 },
            { name: "44mm", price: 160 },
          ],
        },
        {
          name: "iWatch 10",
          sizes: [
            { name: "42mm", price: 270 },
            { name: "46mm", price: 300 },
          ],
        },
        {
          name: "iWatch Ultra 2",
          sizes: [{ name: "49mm", price: 400 }],
        },
        {
          name: "iWatch 9",
          sizes: [{ name: "45mm", price: 200 }],
        },
        {
          name: "iWatch Ultra Milanese",
          sizes: [{ name: "49mm", price: 600 }],
        },
        {
          name: "iWatch 7",
          sizes: [{ name: "45mm", price: 100 }],
        },
        {
          name: "iWatch 8",
          sizes: [{ name: "45mm", price: 130 }],
        },
      ],
      deductions: {
        battery: [
          { name: "90-100%", percent: 8 },
          { name: "80-90%", percent: 16 },
          { name: "70-80%", percent: 25 },
          { name: "0-70%", percent: 35 },
        ],
        accessories: { box: 50, strap: 30, charger: 40 },
      },
    },
    {
      name: "AirPods",
      models: [
        { name: "AirPods 2.1", price: 30 },
        { name: "AirPods 3", price: 50 },
        { name: "AirPods Pro 2", price: 100 },
        { name: "AirPods 4", price: 80 },
        { name: "AirPods 4ANC", price: 100 },
        { name: "AirPods Max", price: 250 },
        { name: "AirPods Max New", price: 330 },
      ],
      deductions: {
        condition: [
          { name: "90-100%", percent: 8 },
          { name: "80-90%", percent: 16 },
          { name: "79-80%", percent: 25 },
        ],
        accessories: { box: 20 },
      },
    },
  ]);
};

module.exports = setDefaultDevices;
