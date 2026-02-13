export class UserResponse {
  id: number;
  name: string;
  last_name: string;
  email: string;
  username: string;
  img_url: string | null;

  constructor(partial: Partial<UserResponse>) {
    this.id = partial.id!;
    this.name = partial.name!;
    this.last_name = partial.last_name!;
    this.email = partial.email!;
    this.username = partial.username!;
    this.img_url = partial.img_url ?? null;
  }
}
