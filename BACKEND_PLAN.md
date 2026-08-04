# Backend Implementation & Feature Plan

## Implemented
- Dependency-free Node.js API and static server
- Secure `Admin` / `SPI99` login using scrypt password hashing
- HttpOnly SameSite session cookie, 8-hour expiry and login rate limiting
- Persistent JSON data store with atomic writes
- Product create/read/update/delete API and stock adjustments
- Transactional sales endpoint, sequential invoices and stock movement history
- Live dashboard totals: products, stock, low stock, daily bills and revenue
- Sales history with date filters
- Existing website appearance and CSS retained

## Run
```powershell
npm start
```
Open `http://127.0.0.1:3000`. Login with `Admin` / `SPI99`.

## API
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/products`
- `PATCH/DELETE /api/products/:id`
- `GET/POST /api/sales`
- `GET /api/dashboard/summary`
- `GET /api/health`

## Next phases
1. Replace JSON persistence with PostgreSQL and Prisma migrations.
2. Add Admin/Cashier permissions and password-change screen.
3. Supplier, purchase entry and stock-receiving workflow.
4. Returns/refunds with reverse stock movements.
5. Customer ledger, expenses, profit and shift closing.
6. Barcode input, PDF invoice and scheduled backups.
7. Integration tests for simultaneous checkout and database recovery.
