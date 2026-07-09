import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = await req.json();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    const invites = await base44.asServiceRole.entities.ContadorInvite.filter({ email });
    if (!invites || invites.length === 0) {
      return Response.json({ applied: false });
    }

    const invite = invites[0];
    await base44.asServiceRole.entities.User.update(user.id, {
      role: 'contador',
      display_name: invite.name,
      phone: invite.phone,
    });
    await base44.asServiceRole.entities.ContadorInvite.delete(invite.id);

    return Response.json({ applied: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});