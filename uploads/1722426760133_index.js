import { getCharacters } from 'rickmortyapi';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import pg from 'pg';

const config = {
    connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("C:\\Users\\НУЯ\\Desktop\\projects\\rickAndMorty\\certs\\root.crt").toString(),
    },
};

async function setupDatabase() {
    const client = new pg.Client(config); // Создаем новый клиент для настройки базы данных

    try {
        await client.connect();
        console.log("Connected to the database");

        // Проверяем наличие таблицы
        const checkTableQuery = `
            SELECT to_regclass('public.aTestRick2') AS table_exists;
        `;
        const result = await client.query(checkTableQuery);

        if (result.rows[0].table_exists) {
            // Если таблица существует, удаляем её
            const dropTableQuery = `
                DROP TABLE public.aTestRick2;
            `;
            await client.query(dropTableQuery);
            console.log("Existing table dropped");
        }

        // Создаем таблицу заново с тремя столбцами
        const createTableQuery = `
            CREATE TABLE public.aTestRick2 (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                data JSONB
            );
        `;
        await client.query(createTableQuery);
        console.log("Table 'aTestRick2' created");

    } catch (error) {
        console.error("Error setting up database:", error);
    } finally {
        await client.end();
        console.log("Disconnected from the database");
    }
}

async function insertCharacters(characters) {
    const client = new pg.Client(config); // Создаем новый клиент для вставки данных

    try {
        await client.connect();
        console.log("Connected to the database");

        // Вставляем данные о персонажах в таблицу
        for (let character of characters) {
            const insertQuery = `
                INSERT INTO public.aTestRick2 (name, data) VALUES ($1, $2);
            `;
            const values = [character.name, JSON.stringify(character)];
            await client.query(insertQuery, values);
        }

        console.log("Data inserted successfully into the database");

    } catch (error) {
        console.error("Error inserting characters into database:", error);
    } finally {
        await client.end();
        console.log("Disconnected from the database");
    }
}

async function fetchAllCharactersAndInsert() {
    try {
        let page = 1;
        let allCharacters = [];

        while (true) {
            const response = await getCharacters({ page });
            const characters = response.data.results; // Получаем массив объектов персонажей текущей страницы

            // Добавляем текущих персонажей в общий массив
            allCharacters = [...allCharacters, ...characters];

            // Извлекаем имена всех персонажей текущей страницы
            const names = characters.map(character => character.name);
            console.log(`Fetched characters from page ${page}`);
            console.log('Character names:', names);

            // Переходим к следующей странице
            page++;

            // Проверяем наличие следующей страницы
            if (!response.data.info.next) {
                break; // Выходим из цикла, если больше нет следующей страницы
            }
        }

        // Записываем все персонажи в файл characters.txt
        const data = JSON.stringify(allCharacters, null, 2);

        // Собираем все имена в один массив
        const allNames = allCharacters.map(character => character.name);

        // Преобразуем в JSON строку и записываем в файл charactersNames.txt
        const namesData = JSON.stringify(allNames, null, 2);

        console.log('Files characters.txt and charactersNames.txt updated successfully!');

        // Вызываем функции для настройки базы данных и вставки данных
        await setupDatabase(); // Настройка базы данных
        await insertCharacters(allCharacters); // Вставка данных в базу

        console.log('Database setup and data insertion completed successfully!');
    } catch (error) {
        console.error('Error fetching or writing characters:', error);
    }
}

fetchAllCharactersAndInsert();