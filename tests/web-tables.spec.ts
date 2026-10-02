import { test } from '../fixtures/test';
import { worker } from '../test-data/workers';

test.describe('Web Tables Tests', () => {
    test('should display the web tables correctly', async ({ webTablesPage }) => {
        await webTablesPage.verifyWebTablesDetails();
    });

    test('should add a worker to the web table', async ({ webTablesPage }) => {
        await webTablesPage.verifyWorkerDoesNotExist(worker);
        await webTablesPage.addWorker(worker);
        await webTablesPage.verifyWorkerExists(worker);
    });

    test('should remove an existing worker from the web table', async ({ webTablesPage }) => {
        const workerToDelete = await webTablesPage.getWorkerByIndex(0);

        await webTablesPage.verifyWorkerExists(workerToDelete);
        await webTablesPage.deleteWorker(workerToDelete);
        await webTablesPage.verifyWorkerDoesNotExist(workerToDelete);
    });

    test('should update an existing worker in the web table', async ({ webTablesPage }) => {
        const workerToEdit = await webTablesPage.getWorkerByIndex(0);
        const updatedWorker = { ...workerToEdit, email: 'UpdatedEmail@example.com' };

        await webTablesPage.verifyWorkerExists(workerToEdit);
        await webTablesPage.editWorker(workerToEdit, updatedWorker);
        await webTablesPage.verifyWorkerExists(updatedWorker);
        await webTablesPage.verifyWorkerDoesNotExist(workerToEdit);
    });
});
