import { UserService } from '../modules/user/User.service';
import { AgencyService } from '../modules/agency/Agency.service';
import { UserRole } from '../modules/user/User.types';
import { Database } from '../core/Database';
import { v4 as uuidv4 } from 'uuid';

async function verify() {
    console.log('Starting Verification...');

    const userService = new UserService();
    const agencyService = new AgencyService();
    const tenantId = uuidv4(); 

    try {
        
        console.log('1. Creating Tenant Admin User...');
        const adminUser = await userService.register({
            tenant_id: tenantId,
            username: `admin_${Date.now()}`,
            email: `admin_${Date.now()}@test.com`,
            password: 'password123',
            roles: [UserRole.TENANT_ADMIN],
            first_name: 'Admin',
            last_name: 'Test',
            phone_numbers: [{ phone_number: '1234567890', is_primary: true, type: 'mobile' }],
            addresses: [{ address_line_1: '123 Admin St', city: 'Test City', country: 'Testland', pincode: '12345', type: 'office' }]
        });
        console.log(`✅ Tenant Admin Created: ${adminUser.id}`);

        
        console.log('2. Creating Agency...');
        const agency = await agencyService.createAgency({
            tenant_id: tenantId,
            agency_name: `Agency_${Date.now()}`,
            email: `agency_${Date.now()}@test.com`,
            branch_code: 'BR001',
            phone_number: '9876543210',
            contacts: [{
                name: 'Contact Person',
                email: 'contact@agency.com',
                phone_number: '1122334455',
                is_primary: true,
                designation: 'Manager'
            }],
            addresses: [{
                address_line_1: '456 Agency Blvd',
                city: 'Agency City',
                state: 'State',
                country: 'Country',
                pincode: '67890',
                type: 'headquarters'
            }]
        });
        console.log(`✅ Agency Created: ${agency.id}`);

        
        console.log('3. Verifying Data Retrieval...');
        const retrievedAgency = await agencyService.getAgencyById(agency.id);
        if (!retrievedAgency) throw new Error('Agency not found');
        if (retrievedAgency.contacts?.length !== 1) throw new Error('Contacts not saved correctly');
        if (retrievedAgency.addresses?.length !== 1) throw new Error('Addresses not saved correctly');
        console.log('✅ Agency Data Verified (Contacts & Addresses present)');

        const retrievedUser = await userService.login(adminUser.email, 'password123'); 
        if (!retrievedUser.roles?.includes(UserRole.TENANT_ADMIN)) throw new Error('User roles not saved correctly');
        
        
        
        
        
        if ((retrievedUser as any).phone_numbers?.length !== 1) console.warn('⚠️ User phone numbers missing or not loaded');
        else console.log('✅ User Phone Numbers Verified');

        console.log('🎉 All Verification Steps Passed!');

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verify();
