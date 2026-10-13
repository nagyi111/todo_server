import express from 'express'
import mysql from 'mysql2/promise'
import { myConfig } from './configDatabase.js'

const app = express()

app.use(express.json())

let connection

try {
    connection = mysql.createPool(myConfig)
    // Teszt, mert a createPool() csak létrehozza
    // a pool objektumot, de itt ellenőrizzük is a kapcsolatot
    await connection.execute('select 1')
    console.log("Sikeres adatbázis kapcsolódás")

} catch (error) {
    console.log("HIBA: ", error)
    process.exit(1)
}

app.get('/todos', async (request, response) => {
    try {
        const sql = 'select * from todolist order by timestamp'
        const [rows, fields] = await connection.execute(sql)
        console.log(rows)
        response.status(200).json(rows)
    } catch (error) {
        console.log(error)
        response.status(500).json({
            msg: "Adatbázis hiba"
        })
    }
})
app.post('/todos',async (request, response)=>{
    const {task}=request.body
    try{
        const sql='insert into todolist (task) values(?)'
        await connection.execute(sql, [task])
        response.status(200).json({msg: 'Sikeres hozzáadás!'})
    } catch (error){
        console.log(error);
    }
})

app.patch('/todos/:id', async (request, response)=>{
    const {id}=request.params
    try {
        const sql='update todolist set complete=NOT complete WHERE id=?'
        const [rows]= await connection.execute(sql, [+id])
        console.log(rows, rows.affectedRows);
        response.status(200).json({msg:'Sikeres módosítás!'})
    } catch (error) {
        console.log(error)
    }
})

app.delete('/todos/:id', async (request, response) => {
    const { id } = request.params
    try {
        const sql = 'delete from todolist where id=?'
        const [rows] = await connection.execute(sql, [+id])
        console.log(rows, rows.affectedRows)
        response.status(200).json({ msg: 'Sikeres törlés!' })
    } catch (error) {
        console.log(error)
    }
})

const port = process.env.PORT || 8000

app.listen(port, () =>
    console.log(`Server listening on port: ${port}...`)
)