from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.hr_contracts.serializers.hr_serializer import (
    HRContractSerializer, LeaveRequestSerializer, StaffReplacementSerializer
)
from apps.hr_contracts.selectors.hr_selector import (
    get_all_hr_contracts, get_hr_contract_by_id, get_all_leave_requests,
    get_leave_request_by_id, get_all_staff_replacements
)
from apps.hr_contracts.services.hr_service import (
    create_hr_contract, terminate_hr_contract, create_leave_request,
    approve_or_reject_leave, assign_staff_replacement
)
from apps.vault.selectors.vault_selector import get_document_by_id


class HRContractListCreateView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        contracts = get_all_hr_contracts(status=status_param)
        serializer = HRContractSerializer(contracts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = HRContractSerializer(data=request.data)
        if serializer.is_valid():
            vault_doc_id = request.data.get('vault_document')
            vault_doc = get_document_by_id(vault_doc_id) if vault_doc_id else None

            contract = create_hr_contract(
                employee_name=serializer.validated_data['employee_name'],
                employee_email=serializer.validated_data['employee_email'],
                position_title=serializer.validated_data['position_title'],
                start_date=serializer.validated_data['start_date'],
                contract_type=serializer.validated_data.get('contract_type', 'CDI'),
                salary_monthly=serializer.validated_data.get('salary_monthly', 0.00),
                end_date=serializer.validated_data.get('end_date'),
                vault_document=vault_doc
            )
            return Response(HRContractSerializer(contract).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HRContractDetailView(APIView):
    def get(self, request, pk):
        contract = get_hr_contract_by_id(pk)
        if not contract:
            return Response({'error': 'Contrat non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(HRContractSerializer(contract).data, status=status.HTTP_200_OK)


class HRContractTerminateView(APIView):
    def post(self, request, pk):
        contract = get_hr_contract_by_id(pk)
        if not contract:
            return Response({'error': 'Contrat non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        term_date = request.data.get('termination_date')
        updated_contract = terminate_hr_contract(contract, termination_date=term_date)
        return Response(HRContractSerializer(updated_contract).data, status=status.HTTP_200_OK)


class LeaveRequestListCreateView(APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        requests = get_all_leave_requests(status=status_param)
        return Response(LeaveRequestSerializer(requests, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LeaveRequestSerializer(data=request.data)
        if serializer.is_valid():
            leave = create_leave_request(
                employee_name=serializer.validated_data['employee_name'],
                employee_email=serializer.validated_data['employee_email'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                leave_type=serializer.validated_data.get('leave_type', 'PAID'),
                reason=serializer.validated_data.get('reason', '')
            )
            return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LeaveRequestApproveRejectView(APIView):
    def post(self, request, pk):
        leave = get_leave_request_by_id(pk)
        if not leave:
            return Response({'error': 'Demande de congé non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        approve = request.data.get('approve', True)
        manager = request.data.get('manager_name', 'RH Manager')
        updated_leave = approve_or_reject_leave(leave, approve=approve, manager_name=manager)
        return Response(LeaveRequestSerializer(updated_leave).data, status=status.HTTP_200_OK)


class StaffReplacementListCreateView(APIView):
    def get(self, request):
        replacements = get_all_staff_replacements()
        return Response(StaffReplacementSerializer(replacements, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = StaffReplacementSerializer(data=request.data)
        if serializer.is_valid():
            leave_id = request.data.get('leave_request')
            leave_req = get_leave_request_by_id(leave_id) if leave_id else None
            rep = assign_staff_replacement(
                absent_employee_name=serializer.validated_data['absent_employee_name'],
                replacement_employee_name=serializer.validated_data['replacement_employee_name'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                leave_request=leave_req,
                notes=serializer.validated_data.get('notes', '')
            )
            return Response(StaffReplacementSerializer(rep).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
