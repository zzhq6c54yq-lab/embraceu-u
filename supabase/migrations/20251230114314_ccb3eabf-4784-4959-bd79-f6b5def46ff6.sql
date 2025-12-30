-- Add admin role for user e3c013be-b6a4-48ba-a411-3867795c1f8c
INSERT INTO public.user_roles (user_id, role)
VALUES ('e3c013be-b6a4-48ba-a411-3867795c1f8c', 'admin')
ON CONFLICT DO NOTHING;