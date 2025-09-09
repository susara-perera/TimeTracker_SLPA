const { createMySQLConnection } = require('./config/mysql');

async function createMySQLSectionsEndpoint() {
  try {
    console.log('Getting MySQL sections for division 8...\n');

    const connection = await createMySQLConnection();

    // Get sections from MySQL for division 8
    const [sections] = await connection.execute(`
      SELECT s.section_id, s.section_name, s.division_id, d.division_name
      FROM sections s
      LEFT JOIN divisions d ON s.division_id = d.division_id
      WHERE s.division_id = ?
      ORDER BY s.section_name ASC
    `, ['8']);

    console.log('MySQL sections for division 8:');
    sections.forEach(section => {
      console.log(`- ID: ${section.section_id}, Name: "${section.section_name}", Division: ${section.division_name}`);
    });

    // Format for frontend
    const formattedSections = sections.map(section => ({
      _id: section.section_id.toString(), // Use MySQL ID as the _id
      section_id: section.section_id,
      section_name: section.section_name,
      division_id: section.division_id,
      name: section.section_name // Alternative property name
    }));

    console.log('\nFormatted for frontend:');
    console.log(JSON.stringify(formattedSections, null, 2));

    await connection.end();

  } catch (error) {
    console.error('Error:', error);
  }
}

createMySQLSectionsEndpoint();
