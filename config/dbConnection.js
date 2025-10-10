import sql from "mssql"

const dbconfig = {
    user: "gssadminlogin",
    password: "23DSds##@@",
    server: "gss-server.database.windows.net",
    database: "gss",
    options: {
        encrypt: true, // REQUIRED for Azure
        trustServerCertificate: true, // Recommended for security
        enableArithAbort: true
    },
    port: 1433
}

// Create and connect the pool once, then export the promise
const poolPromise = new sql.ConnectionPool(dbconfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.error('Database Connection Failed! Bad Config: ', err));

export { sql, poolPromise };