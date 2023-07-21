import { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import ContactItem from "../../../components/ContactItem";
import { Contact, Contacts, fetchContacts } from "../../../lib/api";
import { useUserInfo } from "../../../lib/userContext";
import { Stack, useRouter } from "expo-router";

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contacts>([]);
  const {
    user: { profile },
  } = useUserInfo();

  const router = useRouter();

  useEffect(() => {
    if (profile) fetchContacts(profile.id).then(setContacts);
  }, [profile]);

  const handleContactPress = (contact: Contact) => {
    router.push({
      pathname: `contacts/${contact.username}`,
      params: { contactId: contact.id },
    });

    // navigation.navigate("Chat", {
    //   contactId: contact.id,
    //   username: contact.username || "",
    // });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Contactos",
        }}
      />
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactItem
            contact={item}
            onPressItem={() => handleContactPress(item)}
          />
        )}
      />
    </>
  );
}
const styles = StyleSheet.create({});
