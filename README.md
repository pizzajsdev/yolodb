# YoloDB 🚀

A lightweight, file-based JSON database powered by SuperJSON for Node.js (and compatible) runtimes. Perfect for
prototyping, testing, and when you just need a simple persistent store without the overhead of a full database system.

> Because setting up databases for local development is complex and You Only Live Once!

## Highlights ✨

- 🔄 **Real-time file synchronization** - No stale data in multi-threaded/process environments (such as Next.js server)
- 🎯 **SuperJSON powered** - Support for Dates, Maps, Sets, and more complex data types
- 🛠️ **Developer friendly API** - Familiar CRUD operations with a simple, intuitive interface
- 📦 **Zero configuration** - Just instantiate and start using
- 🔍 **Type-safe** - Built with TypeScript for robust development
- 🧪 **Perfect for testing** - Mock your production database with ease
- 🔍 **Debuggable** - Easily debug your data by checking the table files

## What's different compared to LowDB?

- Uses superjson for serialization/deserialization, so it supports more data types like Dates, Maps, Sets, etc.
- More intuitive interface, easier to use, closer to what would you expect from a real DB abstraction layer.
- Read/write operations are done on-the-fly. Less performant, but you don't need to worry about stale data.
- Comes with handy object-oriented abstractions such as `YoloDbRepository`

## Quick Start

Install the package:

```bash
npm install -D yolodb
```

Example:

```typescript
import { yolodb } from 'yolodb'

// Create a table with a primary key
const usersTable = yolodb<User>('full/path/to/users.json', 'id', [])

// Insert a record
usersTable.insert({
  id: '1',
  name: 'John Doe',
  createdAt: new Date(),
})

// Find by ID
const user = usersTable.findById('1')

// Search with custom filter
const activeUsers = usersTable.search((user) => user.status === 'active')
```

## Why YoloDB? 🤔

### Use Cases

- 🧪 **Testing and Development**
  - Mock your production database (best way is via abstractions such as repository classes)
  - Quick prototyping without database setup
  - Isolated test environments

- 🎮 **Small Applications**
  - Simple data persistence needs
  - Prototypes and MVPs
  - Local development tools

- 📚 **Learning Best Practices**
  - A proof that you data model is well decoupled from the persistence layer, is that it can be mocked with ease
  - Having living proof that your data model is well designed and you can switch between different persistence engines
    with ease

### Advantages

- **Quick data access**: Compared to SQL-based engines, you can easily check the data by opening the JSON files.
- **Simple but Powerful**: Basic CRUD operations with a simple and familiar API
- **No Configuration**: Works out of the box
- **Type Safety**: Full TypeScript support
- **Complex Data Types**: Thanks to SuperJSON
- **Real-time File Access**: Always fresh data
- **Repository Pattern Support**: Clean architecture friendly

### Limitations

- **Not for Production**: Designed for development and testing
- **Performance costs**: Reads table files on every operation, and writes to disk on every write operation
- **Concurrency**: Basic file-based locking
- **Scale**: Not suitable for large datasets, since data is loaded into memory
- **Sorting, Joins and more complex queries**: Not implemented yet.
- **Data migrations**: Not implemented, and not planned.

## API Reference

### Table Operations

```typescript
const table = yolodb<Record>(filePath, primaryKeyField, initialData)

// Basic CRUD
table.all() // Get all records
table.findById(id) // Find by primary key
table.findBy(field, value) // Find by field value
table.search(filterFn) // Custom search
table.insert(record) // Insert single record
table.insertMany(records) // Bulk insert
table.update(record) // Update record
table.updateMany(records) // Bulk update
table.delete(id) // Delete by id
table.deleteMany(ids) // Bulk delete
table.truncate() // Clear all records
```

### Repository Pattern

```typescript
interface UserRepository {
  findByUsername(username: string): User | null
}

class MockedUserRepository extends YoloDbRepository<User> implements UserRepository {
  constructor() {
    super("users.json", "id");
  }

  // Implement interface methods here
}
// Your real repository would look like this:
class DrizzleUserRepository implements UserRepository { ... }
```

## Best Practices 🌟

1. **Use Type Definitions**

   ```typescript
   interface User {
     id: string
     name: string
     createdAt: Date
   }

   const usersTable = yolodb<User>('users.json', 'id', [])
   ```

2. **Implement Repository Pattern**
   - Encapsulate database logic
   - Add domain-specific methods
   - Maintain clean architecture

3. **Handle Errors**

   ```typescript
   try {
     table.insert(record)
   } catch (error) {
     // Handle file system errors
   }
   ```

4. **Clean Up Data**
   ```typescript
   // e.g. in your tests teardown
   table.truncate()
   ```

---

Made with ❤️ for developers who know that sometimes, you just need a simple solution.
