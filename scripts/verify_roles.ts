
import { UserController } from '../src/modules/user/User.controller';
import { AgencyController } from '../src/modules/agency/Agency.controller';
import { UserRole } from '../src/modules/user/User.types';
import { AppError } from '../src/core/ErrorHandler';


const mockUserService: any = {
    register: async (data: any) => { return { ...data, id: 'mock-id' }; },
    login: async () => { }
};

const mockAgencyService: any = {
    createAgency: async () => { },
    getAgenciesByTenant: async () => { },
    getAllAgencies: async () => { },
    getAgencyById: async () => { return { id: 'agency-123' }; }
};


const mockRes: any = {
    status: (code: number) => mockRes,
    json: (data: any) => { console.log('Response JSON:', data); return mockRes; },
    send: (data: any) => { console.log('Response Send:', data); return mockRes; },
};

const runTest = async (name: string, fn: () => Promise<void>) => {
    try {
        console.log(`\n--- Running Test: ${name} ---`);
        await fn();
        console.log(`[PASS] ${name}`);
    } catch (e: any) {
        console.log(`[FAIL] ${name}: ${e.message}`);
    }
};

const main = async () => {
    const userController = new UserController(mockUserService);
    const agencyController = new AgencyController(mockAgencyService);

    
    await runTest('Super Admin creating Agency Executive (Should Fail)', async () => {
        const req: any = {
            user: { user_role: 'SUPER_ADMIN' },
            body: { user_role: 'AGENCY_EXECUTIVE', email: 'test@test.com', password: 'password' }
        };
        let errorCaught = false;
        const next = (err?: any) => {
            if (err && err.message.includes('Super Admin can only create VPs')) {
                errorCaught = true;
            }
        };
        await userController.register(req, mockRes, next);
        if (!errorCaught) throw new Error('Did not receive expected error');
    });

    
    await runTest('Super Admin creating VP (Should Pass)', async () => {
        const req: any = {
            user: { user_role: 'SUPER_ADMIN' },
            body: { user_role: 'VP', email: 'vp@test.com', password: 'password', agency_id: 'agency-123' }
        };
        const next = (err?: any) => { if (err) throw new Error(`Unexpected error: ${err.message}`); };
        await userController.register(req, mockRes, next);
    });

    
    await runTest('VP creating Agency Executive for Own Agency (Should Pass)', async () => {
        const req: any = {
            user: { user_role: 'VP', vp_agency_id: 'agency-123', tenant_id: 'tenant-1' },
            body: { user_role: 'AGENCY_EXECUTIVE', email: 'exec@test.com', password: 'password', agency_id: 'agency-123' }
        };
        const next = (err?: any) => { if (err) throw new Error(`Unexpected error: ${err.message}`); };
        await userController.register(req, mockRes, next);
    });

    
    await runTest('VP creating Agency Executive for DIFFERENT Agency (Should Fail)', async () => {
        const req: any = {
            user: { user_role: 'VP', vp_agency_id: 'agency-123' },
            body: { user_role: 'AGENCY_EXECUTIVE', agency_id: 'agency-999' }
        };
        let errorCaught = false;
        const next = (err?: any) => {
            if (err && err.message.includes('own agency')) {
                errorCaught = true;
            }
        };
        await userController.register(req, mockRes, next);
        if (!errorCaught) throw new Error('Did not receive expected error');
    });

    
    await runTest('VP Viewing Own Agency (Should Pass)', async () => {
        const req: any = {
            user: { user_role: 'VP', vp_agency_id: 'agency-123' },
            params: { id: 'agency-123' }
        };
        const next = (err?: any) => { if (err) throw new Error(`Unexpected error: ${err.message}`); };
        await agencyController.getById(req, mockRes, next);
    });

    
    await runTest('VP Viewing Other Agency (Should Fail)', async () => {
        const req: any = {
            user: { user_role: 'VP', vp_agency_id: 'agency-123' },
            params: { id: 'agency-999' }
        };
        let errorCaught = false;
        const next = (err?: any) => {
            if (err && err.message.includes('permission to view this agency')) {
                errorCaught = true;
            }
        };
        await agencyController.getById(req, mockRes, next);
        if (!errorCaught) throw new Error('Did not receive expected error');
    });
};

main();
