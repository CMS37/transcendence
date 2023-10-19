
import { Injectable, Body, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto, TokenDto } from '../auth/dto/token.dto';
import { getUserDto, addFriendDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private readonly httpService: HttpService,
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        ) {}


    async CreateUser(id: number, nickName: string)
    {
        const newUser = await this.prisma.user.create({
            data: {
                user_id: id,
                nick_name: nickName,
            },
        });
        return newUser;
    }
    
    async GetUserDataByNickName(nickName: string)
    {
        console.log("nick_name :", nickName);
        const userData = await this.prisma.user.findUnique({
            where: {
              nick_name: nickName,
            },
        });
        console.log(userData);
        return Promise.resolve(userData);
    }

    async GetUserDataById(id: number)
    {
        // console.log("user_id :", user_id.user_id);
        const userData = await this.prisma.user.findUnique({
            where: {
              user_id: id,
            },
        });
        console.log("====================User_data=====================\n\n",userData);
        if (userData == null)
            return {status: false, message: "유저 찾기 실패"}
        else
            return Promise.resolve(userData);
    }

    /*
     @return {status: true, message: "success"} 
    */
    async AddFriend(@Body() addFrined : addFriendDto)
    {
        const check =  await this.prisma.friends.findFirst({
            where: {
                following_user_id: addFrined.user_id,
                followed_user_id: addFrined.friend_id,
            },
        });
        if (check !== null)
            return {status: false, message: "already frined"};
        await this.prisma.friends.create({
            data: {
                following_user_id: addFrined.user_id,
                followed_user_id: addFrined.friend_id,
            },
        });
        await this.prisma.friends.create({
            data: {
                following_user_id: addFrined.friend_id,
                followed_user_id: addFrined.user_id,
            },
        });
        return {status: true, message: "success"};
    }

    async DeleteUserById(nickName: string)
    {
        const user = await this.prisma.user.findUnique({
            where: {
              nick_name: nickName,
            },
        });
        if (user == null)
            return {status: false, message: "유저 찾기 실패"}
        const id = user.user_id;

        await this.prisma.friends.deleteMany({
            where: {
                OR: [
                    {
                        following_user_id: id,
                    },
                    {
                        followed_user_id: id,
                    },
                ],
            },
        });
        await this.prisma.tokens.deleteMany({
            where: {
                nick_name: nickName,
            },
        });
        await this.prisma.user.delete({
            where: {
                user_id: id,
            },
        });
        return {status: true, message: "success", delete_user: user.nick_name};
    }

    // async Upload
}


