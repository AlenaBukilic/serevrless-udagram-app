require('source-map-support').install();
import { CustomAuthorizerResult } from 'aws-lambda';
import { verify } from 'jsonwebtoken';
import { JwtToken } from 'src/auth/jwt-tokens';

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJdmGHXzikHVZRMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1qMHpldS0zay51cy5hdXRoMC5jb20wHhcNMjEwMjI4MjI1NjQxWhcN
MzQxMTA3MjI1NjQxWjAkMSIwIAYDVQQDExlkZXYtajB6ZXUtM2sudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu8bz/avrjPZCN4RD
W4u1SUJLtO5Snjl5hEVwEyHsyArV+dR6FxuWjaR79KBIiewGTpvnyRKIFmuntIon
eDEXF81c20qshpOEMMFr+fNDmLVdXrPPRoqRS8U5eRotLn9Vr6kuVR5Q0TAvFT77
JR6A8eU7rMZoPNL0476JQ6GsAWy7gpC6qA2KFuH69HXSQlrAlVY3BSAdxBSmWK90
Mdt1bh7Qy1Yn5s+TuPUp5zbvBP+g3ASi6ZRuK57AuLA6gKNSwrA1+tkx9sRZYKZ1
QanEoXjODAi1P6AytE9648z9QHVmyiqGgY0SW0JlNcCU4bBW/BIPwMdlX9N64s5n
ugxm7wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRc6X6LDvRJ
hrT2rVud/QDN5oqqJDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AIghm/2yjyxwPo3kOCmm0929AX+xyu229hZtOhhotigXeLooEj74tuFKM3voZrfa
Hir9/ErumzmYDEEdXt4Jmw+XPctEeuJkrLSTzp1gXHeb2OJBV6vah2Gwgnvw6BMO
zT4NILpOCDRo5CtfEV0Pqfg3A4Sa840K31Vj5Bpaz9ypcJpYLcmf3XoTnuXaePqz
k30o+z9lK2VAsWpLyiyBtV+F3njjKp0p2sgXk1YmwP4X60t7zj4Zwg754Le9nfOW
zHVMNxZI/4pGlk6QZQs/QqE1BjbuUeFpcY5yhavvHNTOCggfNMRLo70yCdSvp4Cl
Zeb0QQZwjwF9RDMqi1KjRXA=
-----END CERTIFICATE-----`

export const handler = async (event): Promise<CustomAuthorizerResult> => {
    try {
        const decodedToken = verifyToken(
            event.authorizationToken
        );

        return {
        principalId: decodedToken.sub,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: '*'
            }
            ]
        }
        }
    } catch (e) {
        console.log('User was not authorized', e.message)

        return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
            {
                Action: 'execute-api:Invoke',
                Effect: 'Deny',
                Resource: '*'
            }
            ]
        }
        }
    }
}

function verifyToken (authHeader: string): JwtToken {

    if(!authHeader) {
        throw new Error('No authentication header');
    }

    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authentication header');
    }

    const split = authHeader.split(' ');
    const token = split[1];

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken;
}
