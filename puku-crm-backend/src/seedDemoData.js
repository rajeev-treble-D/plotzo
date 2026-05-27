const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Connected to database for seeding...');

        // Utility for random selection
        const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const randomDecimal = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

        const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Sarah', 'David', 'Laura', 'Robert', 'Linda', 'James', 'Barbara', 'William', 'Elizabeth', 'Richard', 'Susan', 'Thomas', 'Jessica', 'Joseph', 'Karen'];
        const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson'];
        const companies = ['TechNova', 'GlobalLink', 'SkyHigh', 'BlueWave', 'PeakFlow', 'DataPrime', 'EcoSmart', 'SwiftEdge', 'NextGen', 'CloudBase', 'BrightMind', 'SilverLine', 'IronHold', 'SoftSphere', 'NeoNet', 'ApexSolutions', 'VistaGroup', 'HorizonCorp', 'ZodiacSystems', 'OmegaLtd'];
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
        const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'India', 'Japan', 'Brazil', 'South Africa'];

        // 1. Fetch existing users and roles
        const [users] = await connection.query('SELECT id FROM users');
        const [roles] = await connection.query('SELECT id, name FROM roles');
        const [stockCats] = await connection.query('SELECT name FROM stock_categories');
        const [expCats] = await connection.query('SELECT id FROM expense_categories');

        if (users.length === 0) {
            console.log('No users found. Please run dbInit first.');
            return;
        }

        const adminUser = users[0].id;

        // 2. Seed Customers (20)
        console.log('Seeding Customers...');
        const customerIds = [];
        for (let i = 1; i <= 20; i++) {
            const firstName = randomItem(firstNames);
            const lastName = randomItem(lastNames);
            const name = `${firstName} ${lastName}`;
            const email = `customer${i}_${Date.now()}@example.com`;
            const phone = `+1-${randomInt(100, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
            const company = randomItem(companies);
            const status = randomItem(['Active', 'Inactive', 'Lead', 'Pending']);
            const address = `${randomInt(100, 999)} Main St`;
            const city = randomItem(cities);
            const country = randomItem(countries);

            const [result] = await connection.query(
                'INSERT INTO customers (name, email, phone, company, status, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, phone, company, status, address, city, country]
            );
            customerIds.push(result.insertId);
        }

        // 3. Seed Leads (20)
        console.log('Seeding Leads...');
        for (let i = 1; i <= 20; i++) {
            const name = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
            const email = `lead${i}_${Date.now()}@example.com`;
            const phone = `+1-${randomInt(100, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
            const opportunity = randomItem(['Software License', 'Consulting Service', 'Hardware Upgrade', 'Maintenance Plan']);
            const valuation = randomDecimal(1000, 50000);
            const stage = randomItem(['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']);
            const temperature = randomItem(['Cold', 'Warm', 'Hot']);
            const description = `Potential lead for ${opportunity} interested in long-term partnership.`;

            await connection.query(
                'INSERT INTO leads (name, email, phone, opportunity, valuation, stage, temperature, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, email, phone, opportunity, valuation, stage, temperature, description]
            );
        }

        // 4. Seed Stock (20)
        console.log('Seeding Stock...');
        const stockItems = ['Laptop Pro', 'Ultra Monitor', 'Wireless Keyboard', 'Optical Mouse', 'USB-C Hub', 'Ergonomic Chair', 'LED Desk Lamp', 'Noise-Cancelling Headphones', 'External SSD 1TB', 'Webcam HD', 'Tablet Air', 'Smart Watch', 'Bluetooth Speaker', 'Router AX', 'Laser Printer', 'HDMI Cable 2m', 'Power Bank', 'Backpack for Laptop', 'Desktop Case', 'Cooling Pad'];
        for (let i = 0; i < 20; i++) {
            const name = stockItems[i] || `Product ${i + 1}`;
            const category = randomItem(stockCats).name;
            const sku = `SKU-${randomInt(1000, 9999)}-${i}`;
            const quantity = randomInt(5, 100);
            const unitPrice = randomDecimal(10, 2000);
            const description = `High-quality ${name} suitable for professional use.`;

            await connection.query(
                'INSERT INTO stock (name, category, sku, quantity, unit_price, description) VALUES (?, ?, ?, ?, ?, ?)',
                [name, category, sku, quantity, unitPrice, description]
            );
        }

        // 5. Seed Sales (20)
        console.log('Seeding Sales...');
        for (let i = 1; i <= 20; i++) {
            const customerId = randomItem(customerIds);
            const userId = adminUser;
            const amount = randomDecimal(100, 10000);
            const status = randomItem(['Pending', 'Completed', 'Cancelled']);
            const paymentMethod = randomItem(['Credit Card', 'PayPal', 'Bank Transfer', 'Cash']);
            const description = `Sale transaction for ${randomItem(companies)} order.`;

            await connection.query(
                'INSERT INTO sales (customer_id, user_id, amount, status, payment_method, description) VALUES (?, ?, ?, ?, ?, ?)',
                [customerId, userId, amount, status, paymentMethod, description]
            );
        }

        // 6. Seed Expenses (20)
        console.log('Seeding Expenses...');
        for (let i = 1; i <= 20; i++) {
            const categoryId = randomItem(expCats).id;
            const amount = randomDecimal(50, 5000);
            const date = new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const description = `Monthly expense for ${randomItem(['office', 'travel', 'subscriptions', 'equipment'])}.`;
            const paymentMethod = randomItem(['Company Card', 'Petty Cash', 'Wire Transfer']);

            await connection.query(
                'INSERT INTO expenses (category_id, amount, date, description, payment_method) VALUES (?, ?, ?, ?, ?)',
                [categoryId, amount, date, description, paymentMethod]
            );
        }

        // 7. Seed Tasks (20)
        console.log('Seeding Tasks...');
        const taskTitles = ['Follow up with lead', 'Prepare proposal', 'System maintenance', 'Review sales report', 'Team meeting', 'Update stock inventory', 'Client feedback session', 'Bug fixing', 'New feature design', 'Market research', 'Competitor analysis', 'Training session', 'Content creation', 'Social media update', 'Backup database', 'Contract renewal', 'Expense audit', 'Security check', 'User feedback review', 'Project kick-off'];
        for (let i = 0; i < 20; i++) {
            const title = taskTitles[i] || `Task ${i + 1}`;
            const description = `Detailed description for ${title}.`;
            const status = randomItem(['Pending', 'In Progress', 'Completed']);
            const priority = randomItem(['Low', 'Medium', 'High']);
            const dueDate = new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const userId = adminUser;

            await connection.query(
                'INSERT INTO tasks (title, description, status, priority, due_date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
                [title, description, status, priority, dueDate, userId]
            );
        }

        // 8. Seed Projects (20)
        console.log('Seeding Projects...');
        const projectNames = ['Project Phoenix', 'Project Alpha', 'Project Blue', 'Operation Skyline', 'Initiative Nexus', 'Project Orion', 'Project Terra', 'Project Sol', 'Project Luna', 'Project Galaxy', 'Project Nebula', 'Project Zenith', 'Project Apex', 'Project Vertex', 'Project Vector', 'Project Pulse', 'Project Echo', 'Project Sierra', 'Project Tango', 'Project Zulu'];
        for (let i = 0; i < 20; i++) {
            const name = projectNames[i] || `Project ${i + 1}`;
            const description = `Major project initiative for ${name}.`;
            const status = randomItem(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']);
            const clientId = randomItem(customerIds);
            const budget = randomDecimal(10000, 100000);
            const startDate = new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const endDate = new Date(Date.now() + randomInt(30, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            await connection.query(
                'INSERT INTO projects (name, description, status, client_id, budget, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, description, status, clientId, budget, startDate, endDate]
            );
        }

        // 9. Seed Activity Logs (20)
        console.log('Seeding Activity Logs...');
        const actions = ['Created', 'Updated', 'Deleted', 'Viewed'];
        const entities = ['Customer', 'Lead', 'Sale', 'Expense', 'Task', 'Project', 'Stock'];
        for (let i = 1; i <= 20; i++) {
            const userId = adminUser;
            const action = randomItem(actions);
            const entityType = randomItem(entities);
            const entityId = randomInt(1, 20);
            const details = `${action} ${entityType} ID: ${entityId} by user.`;

            await connection.query(
                'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
                [userId, action, entityType, entityId, details]
            );
        }

        console.log('Demo data seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
};

seedData();
