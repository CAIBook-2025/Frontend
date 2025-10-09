import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroupDetailsModal } from '@/components/ui/admin/groups/group-details-modal';
import {
  GroupRequestsTable,
  PendingRequest,
  ApprovedRequest,
  RejectedRequest,
} from '@/components/ui/admin/groups/group-requests-table';

describe('GroupDetailsModal', () => {
  const baseRequest: PendingRequest = {
    id: 'req-1',
    type: 'pending',
    groupName: 'Club de Fotografía',
    description: 'Un grupo apasionado por capturar momentos',
    applicantName: 'Ana',
    applicantEmail: 'ana@example.com',
    date: '10/12/2024',
    status: 'Pendiente',
  };

  it('returns null when closed', () => {
    const { container } = render(
      <GroupDetailsModal
        request={baseRequest}
        isOpen={false}
        onClose={jest.fn()}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders details and fires approve handler', () => {
    const onApprove = jest.fn();
    const onClose = jest.fn();
    render(
      <GroupDetailsModal
        request={baseRequest}
        isOpen
        onClose={onClose}
        onApprove={onApprove}
        onReject={jest.fn()}
      />
    );

    expect(screen.getByText(/Club de Fotograf/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));
    expect(onApprove).toHaveBeenCalledWith('req-1');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('GroupRequestsTable', () => {
  it('handles pending request actions', () => {
    const onView = jest.fn();
    const onApprove = jest.fn();
    const onReject = jest.fn();
    const pending: PendingRequest[] = [
      {
        id: '1',
        type: 'pending',
        groupName: 'Club de Debate',
        description: 'Debates semanales',
        applicantName: 'Pedro',
        applicantEmail: 'pedro@example.com',
        date: '12/12/2024',
        status: 'Pendiente',
      },
    ];

    render(
      <GroupRequestsTable
        requests={pending}
        tableType="pending"
        onView={onView}
        onApprove={onApprove}
        onReject={onReject}
      />
    );

    fireEvent.click(screen.getByTitle(/Ver detalles/i));
    expect(onView).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getByRole('button', { name: /Aprobar/i }));
    expect(onApprove).toHaveBeenCalledWith('1');
    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    expect(onReject).toHaveBeenCalledWith('1');
  });

  it('renders approved requests and triggers manage', () => {
    const approved: ApprovedRequest[] = [
      {
        id: '2',
        type: 'approved',
        groupName: 'Club de Programacion',
        description: 'Aprendemos juntos',
        responsibleName: 'Lucía',
        responsibleEmail: 'lucia@example.com',
        date: '11/11/2024',
        approvalDate: '11/11/2024',
        members: 10,
        events: 4,
      },
    ];
    const onManage = jest.fn();

    render(
      <GroupRequestsTable
        requests={approved}
        tableType="approved"
        onView={jest.fn()}
        onManage={onManage}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Gestionar/i }));
    expect(onManage).toHaveBeenCalledWith('2');
  });

  it('displays rejected request reason', () => {
    const rejected: RejectedRequest[] = [
      {
        id: '3',
        type: 'rejected',
        groupName: 'Club de Fiestas',
        description: 'Organizamos eventos',
        applicantName: 'Sofía',
        applicantEmail: 'sofia@example.com',
        date: '10/10/2024',
        rejectionDate: '15/10/2024',
        reason: 'No cumple lineamientos',
      },
    ];

    render(
      <GroupRequestsTable
        requests={rejected}
        tableType="rejected"
        onView={jest.fn()}
      />
    );

    expect(screen.getByText(/No cumple lineamientos/i)).toBeInTheDocument();
  });
});
