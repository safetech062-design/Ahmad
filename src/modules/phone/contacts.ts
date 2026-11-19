import * as Contacts from 'expo-contacts';

export interface ContactMatch {
  name: string;
  numbers: string[];
}

export type ContactSearch = { status: 'ok'; matches: ContactMatch[] } | { status: 'denied'; matches: [] };

/** Search the address book by name. Asks for READ_CONTACTS only when first needed. */
export async function findContacts(query: string, limit = 5): Promise<ContactSearch> {
  const perm = await Contacts.requestPermissionsAsync();
  if (!perm.granted) return { status: 'denied', matches: [] };

  const res = await Contacts.getContactsAsync({
    name: query,
    fields: [Contacts.Fields.PhoneNumbers],
    pageSize: 25,
  });
  const matches: ContactMatch[] = [];
  for (const c of res.data) {
    const numbers = (c.phoneNumbers ?? []).map((p) => p.number ?? p.digits ?? '').filter(Boolean);
    if (numbers.length) matches.push({ name: c.name ?? query, numbers });
    if (matches.length >= limit) break;
  }
  return { status: 'ok', matches };
}

export const looksLikePhoneNumber = (s: string) => /^\+?[\d\s()-]{5,}$/.test(s.trim());
