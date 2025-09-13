import { useQuery } from '@tanstack/react-query';
import { type AxiosResponse } from 'axios';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import type { SelectItem } from 'primereact/selectitem';
import { useEffect, useState, type FormEvent } from 'react';
import api from '../api/api';
import {
  formatLocalDateToIsoDateString,
  getCurrentLocalDate,
  getLocalDateFromIsoDateString,
} from '../utils/dateUtils';

interface Expense {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface GetAllExpensesResponse {
  expenses: Expense[];
}

interface GetExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface CreateExpenseRequest {
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface CreateExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface UpdateExpenseRequest {
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface UpdateExpenseResponse {
  id: number;
  expenseDate: string;
  amount: number;
  description: string;
  expenseCategoryId: number;
  paymentModeId: number;
}

interface ExpenseCategory {
  id: number;
  name: string;
}

interface GetExpenseCategoriesResponse {
  expenseCategories: ExpenseCategory[];
}

interface PaymentMode {
  id: number;
  name: string;
}

interface GetPaymentModesResponse {
  paymentModes: PaymentMode[];
}

const getAllExpenses = async (): Promise<GetAllExpensesResponse> => {
  const response = await api.get<GetAllExpensesResponse>('/v1/expenses');
  return response.data;
};

const getAllExpense = async (expenseId: number): Promise<GetExpenseResponse> => {
  const response = await api.get<GetExpenseResponse>(`/v1/expenses/${expenseId}`);
  return response.data;
};

const deleteExpense = async (expenseId: number): Promise<void> => {
  await api.delete<void>(`/v1/expenses/${expenseId}`);
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
  const [expenseCategoryId, setExpenseCategoryId] = useState<number | null>(null);
  const [paymentModeId, setPaymentModeId] = useState<number | null>(null);

  const { data: expenseCategories, isLoading: expenseCategoriesLoading } = useQuery({
    queryKey: ['expenseCategories'],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    queryFn: () =>
      api
        .get<GetExpenseCategoriesResponse>("/v1/expense-categories")
        .then((response) => response.data.expenseCategories),
  });
  const { data: paymentModes, isLoading: paymentModesLoading } = useQuery({
    queryKey: ['paymentModes'],
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    queryFn: () =>
      api
        .get<GetPaymentModesResponse>("/v1/payment-modes")
        .then((response) => response.data.paymentModes),
  });

  const expenseCategoriesMap: Record<number, ExpenseCategory> = {};
  const expenseCategoryDropdownOptions: SelectItem[] = [];
  if (expenseCategories) {
    expenseCategories.forEach((expenseCategory) => {
      expenseCategoriesMap[expenseCategory.id] = expenseCategory;
      expenseCategoryDropdownOptions.push({
        value: expenseCategory.id,
        label: expenseCategory.name,
      });
    });
  }

  const paymentModesMap: Record<number, PaymentMode> = {};
  const paymentModeDropdownOptions: SelectItem[] = [];
  if (paymentModes) {
    paymentModes.forEach((paymentMode) => {
      paymentModesMap[paymentMode.id] = paymentMode;
      paymentModeDropdownOptions.push({ value: paymentMode.id, label: paymentMode.name });
    });
  }

  const fetchAllExpenses = () => {
    getAllExpenses().then((response) => setExpenses(response.expenses));
  };

  const resetFormFields = () => {
    setAmount(null);
    setExpenseDate(getCurrentLocalDate());
    setDescription(undefined);
    setExpenseCategoryId(null);
    setPaymentModeId(null);
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
    if (!expenseDate || !amount || !description || !expenseCategoryId || !paymentModeId) {
      throw new Error('Error...!');
    }
    const response = await api.post<
      CreateExpenseResponse,
      AxiosResponse<CreateExpenseResponse>,
      CreateExpenseRequest
    >("/v1/expenses", {
      expenseDate: formatLocalDateToIsoDateString(expenseDate),
      amount: amount,
      description: description,
      expenseCategoryId: expenseCategoryId,
      paymentModeId: paymentModeId,
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
      setExpenseDate(getLocalDateFromIsoDateString(response.expenseDate));
      setDescription(response.description);
      setExpenseCategoryId(response.expenseCategoryId);
      setPaymentModeId(response.paymentModeId);
      setDisplayUpdateExpenseDialogBox(true);
    });
  };

  const updateExpense = async (): Promise<UpdateExpenseResponse> => {
    if (
      !expenseDate ||
      !amount ||
      !description ||
      !updatableExpenseId ||
      !expenseCategoryId ||
      !paymentModeId
    ) {
      throw new Error('Error...!');
    }
    const response = await api.put<
      UpdateExpenseResponse,
      AxiosResponse<UpdateExpenseResponse>,
      UpdateExpenseRequest
    >(`/v1/expenses/${updatableExpenseId}`, {
      expenseDate: formatLocalDateToIsoDateString(expenseDate),
      amount: amount,
      description: description,
      expenseCategoryId: expenseCategoryId,
      paymentModeId: paymentModeId,
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

  if (expenseCategoriesLoading || paymentModesLoading) {
    return 'Loading...!';
  }

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
          <Column
            header="Expense category"
            style={{ minWidth: '120px' }}
            body={(rowData: Expense) => {
              if (!expenseCategoriesMap && !expenseCategoriesMap[rowData.expenseCategoryId]) {
                return null;
              }
              return expenseCategoriesMap[rowData.expenseCategoryId].name;
            }}
          ></Column>
          <Column
            header="Payment mode"
            style={{ minWidth: '120px' }}
            body={(rowData: Expense) => {
              if (!paymentModesMap && !paymentModesMap[rowData.paymentModeId]) {
                return null;
              }
              return paymentModesMap[rowData.paymentModeId].name;
            }}
          ></Column>
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
          <div className="field mb-4">
            <label htmlFor="createExpenseCategory" className="block mb-2">
              Expense category
            </label>
            <Dropdown
              id="createExpenseCategory"
              value={expenseCategoryId}
              options={expenseCategoryDropdownOptions}
              onChange={(e) => setExpenseCategoryId(e.value)}
              className="w-full"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="createExpensePaymentMode" className="block mb-2">
              Payment mode
            </label>
            <Dropdown
              id="createExpensePaymentMode"
              value={paymentModeId}
              options={paymentModeDropdownOptions}
              onChange={(e) => setPaymentModeId(e.value)}
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
          <div className="field mb-4">
            <label htmlFor="updateExpenseCategory" className="block mb-2">
              Expense category
            </label>
            <Dropdown
              id="updateExpenseCategory"
              value={expenseCategoryId}
              options={expenseCategoryDropdownOptions}
              onChange={(e) => setExpenseCategoryId(e.value)}
              className="w-full"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="updateExpensePaymentMode" className="block mb-2">
              Payment mode
            </label>
            <Dropdown
              id="updateExpensePaymentMode"
              value={paymentModeId}
              options={paymentModeDropdownOptions}
              onChange={(e) => setPaymentModeId(e.value)}
              className="w-full"
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default ExpenseList;
