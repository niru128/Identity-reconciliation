import pool from "../db/db.js";

export const reconcileIdentity = async(email , phonenumber)=>{

	const client = await pool.connect();

	try{

		await client.query('BEGIN');

		//Check if the contact exists or not

		const existingQuery = `select * from Contact where email = $1 or phonenumber = $2 order by createdAt asc`;

		const {rows : existingContacts} = await client.query(existingQuery , [
			email, 
			phonenumber
		])

		if(existingContacts.length  === 0 ){
			const insertQuery = `insert into Contact (email, phonenumber , linkprecedence) values ($1,$2, 'primary') returning *`;

			const {rows} = await client.query(insertQuery , [email , phonenumber]);
			await client.query('COMMIT');
			return buildResponse(rows);
		}

		//make all the existing contact secondary except the first one which is primary
		let primary = existingContacts.find((c) => c.linkprecedence === 'primary' )|| existingContacts[0];

		for(let contact  of existingContacts){
			if(contact.id != primary.id && contact.linkprecedence === 'primary'){

				await client.query(`update Contact set linkprecedence = 'secondary', linkedId = $1, updatedAt = Now() where id=$2`,[primary.id , contact.id])
			}
		}

		//merge if either the email or phone number is same 

		const emailExists = existingContacts.some((c) => c.email === email);
		const phoneExists = existingContacts.some((c)=> c.phonenumber === phonenumber);

		if(!emailExists || !phoneExists){
			await client.query(`insert into Contact (email, phonenumber , linkprecedence, linkedId) values ($1,$2,'secondary', $3)`,[email , phonenumber , primary.id]);
		}

		//fetch all the contacts linked to the primary contact

		const fetchAllContacts  = `select * from Contact where id = $1 or linkedId = $1 order by createdAt asc`;
		const {rows : allContacts} =  await client.query(fetchAllContacts , [primary.id]);

		await client.query('COMMIT');

		return buildResponse(allContacts);

	}catch(error){

		await client.query('ROLLBACK');
		throw error;

	}finally{
		client.release();
	}

};

const buildResponse = (contacts) => {
  // find primary
  const primary = contacts.find(c => c.linkprecedence === "primary");

  // collect unique emails & phones
  const emailsSet = new Set();
  const phonesSet = new Set();

  contacts.forEach(c => {
    if (c.email) emailsSet.add(c.email);
    if (c.phonenumber) phonesSet.add(c.phonenumber);
  });

  // ensure primary email & phone are first
  const emails = [
    primary.email,
    ...[...emailsSet].filter(e => e !== primary.email),
  ].filter(Boolean);

  const phoneNumbers = [
    primary.phonenumber,
    ...[...phonesSet].filter(p => p !== primary.phonenumber),
  ].filter(Boolean);

  const secondaryContactIds = contacts
    .filter(c => c.linkprecedence === "secondary")
    .map(c => c.id);

  return {
    contact: {
      primaryContactId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};