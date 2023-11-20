import { atom } from "jotai";
import { User } from "./types";

const userAtom = atom<User | null>(null);
export { userAtom };
