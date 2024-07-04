import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  dummyId,
  hashedPassword,
  userMock,
} from '../../test/stubs/user.dto.stub';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  accessToken,
  hashedRefreshToken,
  refreshToken,
} from '../../test/stubs/auth.stub';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  const userRepositoryToken: string | Function = getRepositoryToken(User);

  beforeEach(async () => {
    const authModule: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ConfigService,
        UserService,
        {
          provide: userRepositoryToken,
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = authModule.get<AuthService>(AuthService);
    userRepository = authModule.get<Repository<User>>(userRepositoryToken);
  });

  afterAll(async () => {});

  afterEach(async () => {});

  describe('validate user', () => {
    it('should validate user by email and password', async () => {
      const existingUser = { ...userMock, id: dummyId } as User;

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ ...existingUser, password: hashedPassword });

      const user = await service.validateUser(
        userMock.email,
        userMock.password,
      );

      expect(user.id).toEqual(dummyId);
    });

    it('should throw error when password is wrong', async () => {
      try {
        const existingUser = { ...userMock, id: dummyId } as User;

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValueOnce(existingUser);

        await service.validateUser(userMock.email, userMock.password);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw error when user does not exist', async () => {
      try {
        jest.spyOn(userRepository, 'findOne').mockImplementationOnce(() => {
          throw new NotFoundException('User not found');
        });

        await service.validateUser(userMock.email, userMock.password);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('signup user', () => {
    it('should create user and return auth tokens', async () => {
      const existingUser = { ...userMock, id: dummyId } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValueOnce({ ...existingUser, password: hashedPassword });

      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValueOnce({ raw: [], generatedMaps: [], affected: 1 });

      jest.spyOn(service, 'getTokens').mockImplementationOnce(() => {
        return Promise.resolve({
          accessToken,
          refreshToken,
        });
      });

      const tokens = await service.signUp(userMock);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('throws error if user already exists', async () => {
      try {
        const existingUser = { ...userMock, id: dummyId } as User;

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValueOnce(existingUser);

        await service.signUp(userMock);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
    });
  });

  describe('sign in', () => {
    it('should validate and sign in user', async () => {
      const existingUser = { ...userMock, id: dummyId } as User;

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ ...existingUser, password: hashedPassword });

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValueOnce({ raw: [], generatedMaps: [], affected: 1 });

      jest.spyOn(service, 'getTokens').mockImplementationOnce(() => {
        return Promise.resolve({
          accessToken,
          refreshToken,
        });
      });

      const tokens = await service.signIn(userMock.email, userMock.password);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });

  describe('get tokens', () => {
    it('should create access and refresh tokens and return', async () => {
      jest.spyOn(service, 'getTokens').mockImplementationOnce(() => {
        return Promise.resolve({
          accessToken,
          refreshToken,
        });
      });

      const tokens = await service.getTokens(dummyId, userMock.email);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const existingUser = { ...userMock, id: dummyId, refreshToken } as User;

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValueOnce({ raw: [], generatedMaps: [], affected: 1 });

      await service.logout(dummyId);

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: dummyId },
        {
          refreshToken: null,
        },
      );
    });
  });

  describe('refresh tokens', () => {
    it('should refresh access and refresh tokens', async () => {
      const existingUser = {
        ...userMock,
        id: dummyId,
        refreshToken: hashedRefreshToken,
      } as User;

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      jest.spyOn(service, 'getTokens').mockImplementationOnce(() => {
        return Promise.resolve({
          accessToken,
          refreshToken,
        });
      });

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(existingUser);

      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValueOnce({ raw: [], generatedMaps: [], affected: 1 });

      const tokens = await service.refreshTokens(dummyId, refreshToken);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    it('should throw error if user does not have refresh token', async () => {
      try {
        const existingUser = {
          ...userMock,
          id: dummyId,
        } as User;

        jest
          .spyOn(userRepository, 'findOneBy')
          .mockResolvedValueOnce(existingUser);

        await service.refreshTokens(dummyId, refreshToken);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should throw error if refresh tokens does not match', async () => {
      try {
        const existingUser = {
          ...userMock,
          id: dummyId,
          refreshToken,
        } as User;

        jest
          .spyOn(userRepository, 'findOneBy')
          .mockResolvedValueOnce(existingUser);

        await service.refreshTokens(dummyId, refreshToken);
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
