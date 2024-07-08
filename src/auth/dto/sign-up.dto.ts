import { USER_TYPE } from '../../user/types';

export class SignUpDto {
  readonly nickname: string;

  readonly type: USER_TYPE;

  readonly email: string;

  readonly password: string;
}
