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
  const response = await axios.get<GetAllExpensesResponse>('http://localhost:8080/v1/expenses');
  return response.data;
};

const getAllExpense = async (expenseId: number): Promise<GetExpenseResponse> => {
  const response = await axios.get<GetExpenseResponse>(
    `http://localhost:8080/v1/expenses/${expenseId}`
  );
  return response.data;
};

const deleteExpense = async (expenseId: number): Promise<void> => {
  await axios.delete<void>(`http://localhost:8080/v1/expenses/${expenseId}`);
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
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [description, setDescription] = useState<string>();

  const fetchAllExpenses = () => {
    getAllExpenses().then((response) => setExpenses(response.expenses));
  };

  const resetFormFields = () => {
    setAmount(null);
    setExpenseDate(new Date());
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
    const response = await axios.post<
      CreateExpenseResponse,
      AxiosResponse<CreateExpenseResponse>,
      CreateExpenseRequest
    >('http://localhost:8080/v1/expenses', {
      expenseDate: expenseDate.toISOString(),
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
    >(`http://localhost:8080/v1/expenses/${updatableExpenseId}`, {
      expenseDate: expenseDate.toISOString(),
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
      <>
        <Button
          icon="pi pi-pencil"
          className="p-button-warning"
          onClick={() => openUpdateExpenseDialogBox(rowData.id)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={() => openDeleteConfirmDialog(rowData.id)}
        />
      </>
    );
  };

  return (
    <div>
      <Button label="Add Expense" icon="pi pi-plus" onClick={openCreateExpenseDialogBox} />
      <DataTable value={expenses}>
        <Column field="id" header="ID"></Column>
        <Column field="expenseDate" header="Expense date"></Column>
        <Column field="amount" header="Amount"></Column>
        <Column field="description" header="Description"></Column>
        <Column body={actionBodyTemplate}></Column>
      </DataTable>
      <ConfirmDialog />
      <Dialog
        header="Create Expense"
        visible={displayCreateExpenseDialogBox}
        onHide={closeCreateExpenseDialogBox}
      >
        <form onSubmit={handleCreateExpenseSubmit}>
          <div>
            <div>
              <label htmlFor="amount">Amount</label>
              <InputNumber
                inputId="amount"
                value={amount}
                onValueChange={(e) => setAmount(e.value as number)}
              />
            </div>
            <div>
              <label htmlFor="expenseDate">Expense date</label>
              <Calendar value={expenseDate} onChange={(e) => setExpenseDate(e.value as Date)} />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button label="Save" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>
      <Dialog
        header="Update Expense"
        visible={displayUpdateExpenseDialogBox}
        onHide={closeUpdateExpenseDialogBox}
      >
        <form onSubmit={handleUpdateExpenseSubmit}>
          <div>
            <div>
              <label htmlFor="amount">Amount</label>
              <InputNumber
                inputId="amount"
                value={amount}
                onValueChange={(e) => setAmount(e.value as number)}
              />
            </div>
            <div>
              <label htmlFor="expenseDate">Expense date</label>
              <Calendar value={expenseDate} onChange={(e) => setExpenseDate(e.value as Date)} />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <InputTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button label="Save" icon="pi pi-check" type="submit" />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ExpenseList;
