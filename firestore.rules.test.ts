import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import * as fs from 'fs';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Rules Security Tests', () => {
  it('1. Identity Spoofing: Client tries to set self to admin', async () => {
    const unauthed = testEnv.unauthenticatedContext();
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com', email_verified: true });
    
    // First create as client
    await assertSucceeds(alice.firestore().doc('users/alice').set({
      email: 'alice@test.com', role: 'client'
    }));
    
    // Try to update to admin
    await assertFails(alice.firestore().doc('users/alice').update({
      role: 'admin'
    }));
  });

  it('2. Shadow Update: Inject forbidden field into project', async () => {
    const admin = testEnv.authenticatedContext('admin', { email: 'machariag605@gmail.com', email_verified: true });
    await assertSucceeds(admin.firestore().doc('projects/p1').set({
      clientId: 'c1', updatedAt: new Date(), siteParams: {}
    }));

    const staff = testEnv.authenticatedContext('staff', { email: 'staff@test.com', email_verified: true });
    await assertSucceeds(admin.firestore().doc('users/staff').set({
      email: 'staff@test.com', role: 'project_manager'
    }));
    await assertSucceeds(admin.firestore().doc('users/p1').set({
      email: 'p1@test.com', role: 'client', assignedStaff: ['staff']
    }));

    await assertFails(staff.firestore().doc('projects/p1').update({
      ghostField: 'should fail'
    }));
  });

  it('3. PII Leak: Client tries to read another client user profile', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@test.com', email_verified: true });
    const bob = testEnv.authenticatedContext('bob', { email: 'bob@test.com', email_verified: true });
    
    await assertSucceeds(alice.firestore().doc('users/alice').set({
      email: 'alice@test.com', role: 'client'
    }));

    await assertFails(bob.firestore().doc('users/alice').get());
  });

});
