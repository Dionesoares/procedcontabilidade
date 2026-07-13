import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'contador') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, userId, name, phone, email } = await req.json();

    if (action === 'list') {
      const users = await base44.asServiceRole.entities.User.list();
      const contadores = users.filter((u) => u.role === 'contador');
      return Response.json({ contadores });
    }

    if (action === 'findByEmail') {
      if (!email) return Response.json({ error: 'email is required' }, { status: 400 });
      const users = await base44.asServiceRole.entities.User.list();
      const found = users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null;
      return Response.json({ user: found });
    }

    if (action === 'grantAccess') {
      if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });
      await base44.asServiceRole.entities.User.update(userId, { role: 'contador', display_name: name, phone });
      return Response.json({ success: true });
    }

    if (action === 'update') {
      if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });
      await base44.asServiceRole.entities.User.update(userId, { display_name: name, phone });
      return Response.json({ success: true });
    }

    if (action === 'delete') {
      if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });
      await base44.asServiceRole.entities.User.delete(userId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});