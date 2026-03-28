import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { mySchema } from './schema'
import { migrations } from './migrations'

export const adapter = new SQLiteAdapter({
    schema: mySchema,
    migrations,
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error('Database setup error', error);
    }
})
