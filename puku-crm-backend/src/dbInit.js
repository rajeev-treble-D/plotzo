const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const initDB = async (providedConnection = null) => {
  let connection;
  try {
    connection = providedConnection ? providedConnection : await pool.getConnection();

    console.log('Successfully connected to MySQL database.');

    console.log('Successfully connected to MySQL database.');

    // Create Roles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        permissions JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Customers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        phone VARCHAR(20),
        company VARCHAR(100),
        status ENUM('Active', 'Inactive', 'Lead', 'Pending') DEFAULT 'Lead',
        address TEXT,
        city VARCHAR(50),
        country VARCHAR(50),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // await connection.query(`DROP TABLE IF EXISTS followups`);

    // Create Leads Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20) NOT NULL,
        source VARCHAR(100),
        propertyType VARCHAR(100),
        specificProperty VARCHAR(255),
        budget VARCHAR(100),
        preferredState VARCHAR(100),
        preferredCity VARCHAR(100),
        assignedTo VARCHAR(255),
        temprature VARCHAR(100),
        status VARCHAR(100),
        followupDate DATE,
        followupTime TIME,
        enquiryType ENUM('Tele', 'Sales') DEFAULT 'Tele',
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT,
        status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Pending',
        reset_password_token VARCHAR(255) NULL,
        reset_password_expires DATETIME NULL,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
      )
    `);

    // Insert Default Roles if they don't exist
    const [existingRoles] = await connection.query('SELECT COUNT(*) as count FROM roles');
    if (existingRoles[0].count === 0) {
      await connection.query(`
        INSERT INTO roles (name, description) VALUES 
        ('Admin', 'Full system access'),
        ('Manager', 'Management and reporting access'),
        ('Sales Agent', 'CRM and sales access'),
        ('Support', 'Customer support access')
      `);
      console.log('Default roles inserted.');
    }

    // Insert Default Admin if users table is empty
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      const [adminRole] = await connection.query("SELECT id FROM roles WHERE name = 'Admin'");
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role_id, status) VALUES 
        ('Admin User', 'admin@puku.com', ?, ?, 'Active')
      `, [hashedPassword, adminRole[0].id]);
      console.log('Default admin user created: admin@puku.com / admin123');
    }



    // Create Stock Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(20) DEFAULT '#3b82f6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert Default Stock Categories if they don't exist
    const [existingStockCats] = await connection.query('SELECT COUNT(*) as count FROM stock_categories');
    if (existingStockCats[0].count === 0) {
      await connection.query(`
        INSERT INTO stock_categories (name, description, color) VALUES 
        ('Electronics', 'Devices, gadgets and hardware.', '#3b82f6'),
        ('Furniture', 'Office and home furniture.', '#f59e0b'),
        ('Peripherals', 'Accessories and plug-in devices.', '#10b981'),
        ('Office Supplies', 'Stationery and daily office needs.', '#6366f1'),
        ('Software', 'Licenses and digital products.', '#ef4444')
      `);
      console.log('Default stock categories inserted.');
    }

    // Create Stock Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        sku VARCHAR(50) UNIQUE,
        quantity INT DEFAULT 0,
        unit_price DECIMAL(15, 2) DEFAULT 0.00,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);


    // Create Sales Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        user_id INT,
        amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
        payment_method VARCHAR(50),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);


    // Create Expense Categories Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(20) DEFAULT '#3b82f6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Expenses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        date DATE NOT NULL,
        description TEXT,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE
      )
    `);

    // Insert Seed Expense Categories if table is empty
    const [existingExpCategories] = await connection.query('SELECT COUNT(*) as count FROM expense_categories');
    if (existingExpCategories[0].count === 0) {
      await connection.query(`
        INSERT INTO expense_categories (name, description, color) VALUES 
        ('Office Supplies', 'Paper, ink, and general office tools.', '#3b82f6'),
        ('Travel', 'Flights, hotels, and transport.', '#f59e0b'),
        ('Marketing', 'Ads and promotional materials.', '#10b981'),
        ('Utilities', 'Electricity, water, and internet.', '#6366f1'),
        ('Payroll', 'Employee salaries and bonuses.', '#ef4444')
      `);
      console.log('Seed expense categories inserted.');
    }


    // Create Tasks Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        due_date DATE,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create Projects Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
        client_id INT,
        budget DECIMAL(15, 2) DEFAULT 0.00,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);

    // Create Activity Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create Settings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        key_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create States Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Cities Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL,
        city_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id)
        REFERENCES states(id)
        ON DELETE CASCADE
      )
    `);

    // Create Properties Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_name VARCHAR(255) NOT NULL,
        property_type ENUM(
          'plot',
          'apartment',
          'joint_venture',
          'rental'
        ) NOT NULL,
        state_id INT NOT NULL,
        city_id INT NOT NULL,
        project_name VARCHAR(255),
        status ENUM(
          'available',
          'sold',
          'rented',
          'under_construction'
        ) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id)
        REFERENCES states(id)
        ON DELETE CASCADE,
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
        ON DELETE CASCADE
      )
    `);

    // Create Plot Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS plot_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL UNIQUE,
        area_sq_yard DECIMAL(10,2),
        dimensions VARCHAR(100),
        facing VARCHAR(50),
        price_per_sq_yard DECIMAL(15,2),
        total_price DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
      )
    `);

    // Create Apartment Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apartment_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL UNIQUE,
        bhk_type VARCHAR(50),
        area_sqft DECIMAL(10,2),
        floor VARCHAR(50),
        tower_block VARCHAR(100),
        amenities TEXT,
        total_price DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
      )
    `);

    // Create Joint Venture Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS joint_venture_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL UNIQUE,
        partner_name VARCHAR(255),
        profit_sharing_ratio VARCHAR(50),
        land_area DECIMAL(15,2),
        project_status VARCHAR(100),
        total_project_value DECIMAL(15,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
      )
    `);

    // Create Rental Details Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rental_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        property_id INT NOT NULL UNIQUE,
        area_sqft DECIMAL(10,2),
        monthly_rent DECIMAL(15,2),
        security_deposit DECIMAL(15,2),
        lease_period VARCHAR(100),
        tenant_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS temperatures (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      INSERT IGNORE INTO temperatures (name) VALUES
      ('Cold'),
      ('Warm'),
      ('Hot'),
      ('Very Hot'),
      ('Mature')
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS followups (
          id INT PRIMARY KEY AUTO_INCREMENT,
          lead_id INT NOT NULL,
          disposition VARCHAR(100) NOT NULL,
          meta JSON,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

    // Insert Google API Key placeholder if not exists
    const [existingGeminiKey] = await connection.query('SELECT COUNT(*) as count FROM settings WHERE key_name = "gemini_api_key"');
    if (existingGeminiKey[0].count === 0) {
      await connection.query('INSERT INTO settings (key_name, key_value) VALUES ("gemini_api_key", "")');
      console.log('Gemini API Key placeholder added to settings.');
    }

    console.log('Database tables initialized.');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    if (connection && !providedConnection) {
      connection.release();
    }
  }
};

module.exports = initDB;
