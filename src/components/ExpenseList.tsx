import axios, { type AxiosResponse } from 'axios';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useState, type FormEvent } from 'react';
import { formatLocalDateToIsoDateString, getCurrentLocalDate } from '../utils/dateUtils';
import { appConfig } from '../config/appConfig';

interface Expense {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
}

interface GetAllExpensesResponse {
  expenses: Expense[];
}

interface GetExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
}

interface CreateExpenseRequest {
  expenseDate: string;
  amount: number;
  description: string;
}

interface CreateExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
}

interface UpdateExpenseRequest {
  expenseDate: string;
  amount: number;
  description: string;
}

interface UpdateExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
}

const getAllExpenses = async (): Promise<GetAllExpensesResponse> => {
  const response = await axios.get<GetAllExpensesResponse>(`${appConfig.API_URL}/v1/expenses`);
  return response.data;
};

const getAllExpense = async (expenseId: number): Promise<GetExpenseResponse> => {
  const response = await axios.get<GetExpenseResponse>(
    `${appConfig.API_URL}/v1/expenses/${expenseId}`
  );
  return response.data;
};

const deleteExpense = async (expenseId: number): Promise<void> => {
  await axios.delete<void>(`${appConfig.API_URL}/v1/expenses/${expenseId}`);
};

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Create expense state
  const [displayCreateExpenseDialogBox, setDisplayCreateExpenseDialogBox] =
    useState<boolean>(false);

  // Update expense state
  const [displayUpdateExpenseDialogBox, setDisplayUpdateExpenseDialogBox] =
    useState<boolean>(false);
  const [updatableExpenseId, setUpdatableExpenseId] = useState<number | null>(null);

  // Form fields
  const [amount, setAmount] = useState<number | null>(null);
  const [expenseDate, setExpenseDate] = useState<Date>(getCurrentLocalDate());
  const [description, setDescription] = useState<string>();

  const fetchAllExpenses = () => {
    getAllExpenses().then((response) => setExpenses(response.expenses));
  };

  const resetFormFields = () => {
    setAmount(null);
    setExpenseDate(getCurrentLocalDate());
    setDescription(undefined);
  };

  // Create expense functions
  const closeCreateExpenseDialogBox = () => {
    setDisplayCreateExpenseDialogBox(false);
    resetFormFields();
  };

  const openCreateExpenseDialogBox = () => {
    setDisplayCreateExpenseDialogBox(true);
  };

  const createExpense = async (): Promise<CreateExpenseResponse> => {
    if (!expenseDate || !amount || !description) {
      throw new Error('Error...!');
    }
    console.log('expenseDate', expenseDate);
    console.log('expenseDate.toISOString()', expenseDate.toISOString());
    console.log('formatDate(expenseDate)', formatLocalDateToIsoDateString(expenseDate));
    const response = await axios.post<
      CreateExpenseResponse,
      AxiosResponse<CreateExpenseResponse>,
      CreateExpenseRequest
    >(`${appConfig.API_URL}/v1/expenses`, {
      expenseDate: formatLocalDateToIsoDateString(expenseDate),
      amount: amount,
      description: description,
    });
    return response.data;
  };

  const handleCreateExpenseSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createExpense().then(() => {
      fetchAllExpenses();
      closeCreateExpenseDialogBox();
    });
  };

  // Update expense functions
  const closeUpdateExpenseDialogBox = () => {
    setDisplayUpdateExpenseDialogBox(false);
    setUpdatableExpenseId(null);
    resetFormFields();
  };

  const openUpdateExpenseDialogBox = (expenseId: number) => {
    resetFormFields();
    setUpdatableExpenseId(expenseId);
    getAllExpense(expenseId).then((response) => {
      setAmount(response.amount);
      setExpenseDate(new Date(response.expenseDate));
      setDescription(response.description);
      setDisplayUpdateExpenseDialogBox(true);
    });
  };

  const updateExpense = async (): Promise<UpdateExpenseResponse> => {
    if (!expenseDate || !amount || !description || !updatableExpenseId) {
      throw new Error('Error...!');
    }
    const response = await axios.put<
      UpdateExpenseResponse,
      AxiosResponse<UpdateExpenseResponse>,
      UpdateExpenseRequest
    >(`${appConfig.API_URL}/v1/expenses/${updatableExpenseId}`, {
      expenseDate: formatLocalDateToIsoDateString(expenseDate),
      amount: amount,
      description: description,
    });
    return response.data;
  };

  const handleUpdateExpenseSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateExpense().then(() => {
      fetchAllExpenses();
      closeUpdateExpenseDialogBox();
    });
  };

  useEffect(() => {
    fetchAllExpenses();
  }, []);

  const openDeleteConfirmDialog = (expenseId: number) => {
    confirmDialog({
      message: 'Do you want to delete this expense?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => {
        deleteExpense(expenseId).then(() => fetchAllExpenses());
      },
    });
  };

  const actionBodyTemplate = (rowData: Expense) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-warning p-button-sm"
          onClick={() => openUpdateExpenseDialogBox(rowData.id)}
          tooltip="Edit"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => openDeleteConfirmDialog(rowData.id)}
          tooltip="Delete"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
        <h2 className="m-0 text-lg font-semibold">Expenses</h2>
        <Button
          label="Add Expense"
          icon="pi pi-plus"
          className="p-button-sm"
          onClick={openCreateExpenseDialogBox}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <DataTable
          value={expenses}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          className="p-datatable-sm shadow-md rounded-lg"
          tableStyle={{ minWidth: '900px' }}
          scrollable
        >
          <Column
            body={actionBodyTemplate}
            header="Actions"
            style={{ minWidth: '120px', textAlign: 'center' }}
            frozen
          ></Column>
          <Column field="id" header="ID" style={{ minWidth: '80px' }}></Column>
          <Column field="expenseDate" header="Expense date" style={{ minWidth: '150px' }}></Column>
          <Column field="amount" header="Amount" style={{ minWidth: '120px' }}></Column>
          <Column field="description" header="Description" style={{ minWidth: '200px' }}></Column>
        </DataTable>
      </div>
      <ConfirmDialog />
      <Dialog
        header="Create Expense"
        visible={displayCreateExpenseDialogBox}
        onHide={closeCreateExpenseDialogBox}
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
        className="p-fluid"
        footer={
          <div>
            <Button type="button" label="Cancel" onClick={closeCreateExpenseDialogBox} />
            <Button
              label="Save"
              icon="pi pi-check"
              type="submit"
              form="createExpenseForm"
              autoFocus
            />
          </div>
        }
      >
        <form id="createExpenseForm" onSubmit={handleCreateExpenseSubmit}>
          <div className="field mb-4">
            <label htmlFor="createExpenseAmount" className="block mb-2">
              Amount
            </label>
            <InputNumber
              inputId="createExpenseAmount"
              value={amount}
              onValueChange={(e) => setAmount(e.value as number)}
              className="w-full"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="createExpenseDate" className="block mb-2">
              Expense date
            </label>
            <Calendar
              id="createExpenseDate"
              value={expenseDate}
              showIcon
              onChange={(e) => setExpenseDate(e.value as Date)}
              className="w-full"
              dateFormat="yy-mm-dd"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="createExpenseDescription" className="block mb-2">
              Description
            </label>
            <InputTextarea
              id="createExpenseDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              autoResize
              className="w-full"
            />
          </div>
        </form>
      </Dialog>
      <Dialog
        header="Update Expense"
        visible={displayUpdateExpenseDialogBox}
        onHide={closeUpdateExpenseDialogBox}
        modal
        style={{ width: '90vw', maxWidth: '500px' }}
        className="p-fluid"
        footer={
          <div>
            <Button type="button" label="Cancel" onClick={closeUpdateExpenseDialogBox} />
            <Button
              label="Save"
              icon="pi pi-check"
              type="submit"
              form="updateExpenseForm"
              autoFocus
            />
          </div>
        }
      >
        <form id="updateExpenseForm" onSubmit={handleUpdateExpenseSubmit}>
          <div className="field mb-4">
            <label htmlFor="updateExpenseAmount" className="block mb-2">
              Amount
            </label>
            <InputNumber
              inputId="updateExpenseAmount"
              value={amount}
              onValueChange={(e) => setAmount(e.value as number)}
              className="w-full"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="updateExpenseDate" className="block mb-2">
              Expense date
            </label>
            <Calendar
              id="updateExpenseDate"
              value={expenseDate}
              showIcon
              onChange={(e) => setExpenseDate(e.value as Date)}
              className="w-full"
              dateFormat="yy-mm-dd"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="updateExpenseDescription" className="block mb-2">
              Description
            </label>
            <InputTextarea
              id="updateExpenseDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              autoResize
              className="w-full"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default ExpenseList;
