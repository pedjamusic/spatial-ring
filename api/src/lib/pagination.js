/**
 * Shared pagination helpers for API routes.
 *
 * Usage in a route:
 *   import { paginateQuery, paginateResponse } from '../lib/pagination.js';
 *
 *   router.get('/', async (req, res) => {
 *     const { skip, take, page, limit, search } = paginateQuery(req);
 *     const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
 *     const [data, total] = await Promise.all([
 *       prisma.model.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
 *       prisma.model.count({ where }),
 *     ]);
 *     res.json(paginateResponse(data, total, { page, limit }));
 *   });
 */

export function paginateQuery(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const search = (req.query.search || '').trim() || undefined;

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
    search,
  };
}

export function paginateResponse(data, total, { page, limit }) {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
