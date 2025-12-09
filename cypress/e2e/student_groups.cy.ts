import {
    loginAsStudent,
    navigateToCreateGroup,
    fillGroupName,
    fillGroupDescription,
    fillGroupStep2,
    submitGroupCreation,
    verifyGroupRequestExists,
} from '../support/studentFlows';

describe('Student Group Creation', () => {
    beforeEach(() => {
        loginAsStudent();
    });

    it('Create Group - Complete Flow', () => {
        const groupName = 'Cypress Group ' + Date.now();
        const description = 'Testing group creation via Cypress';
        const goal = 'To verify that the group creation flow works correctly in mock mode';

        navigateToCreateGroup();

        fillGroupName(groupName);
        cy.wait(500);
        fillGroupDescription(description);

        fillGroupStep2(goal);

        cy.wait(500);
        submitGroupCreation();
    });
});
