export interface IRedisService {
    isTokenBlacklisted(token: string): Promise<boolean>;
}