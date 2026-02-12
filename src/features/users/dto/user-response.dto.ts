export class UserResponse {
  id: number;
  name: string;
  last_name: string;
  email: string;
  username: string;
  img_url: string | null;

  constructor(partial: Partial<UserResponse>) {
    Object.assign(this, partial);
  }
}
