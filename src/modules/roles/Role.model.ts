import { RolesInterface } from "./Roles.types";

export default class Roles implements RolesInterface {
  id: string;
  role: string;
  constructor(Data: RolesInterface) {
    this.id = Data.id;
    this.role = Data.role;
  }
}
