from rest_framework import serializers
from apps.hr_contracts.models import HRContract, LeaveRequest, StaffReplacement


class StaffReplacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffReplacement
        fields = ['id', 'absent_employee_name', 'replacement_employee_name', 'leave_request', 'start_date', 'end_date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class LeaveRequestSerializer(serializers.ModelSerializer):
    replacements = StaffReplacementSerializer(many=True, read_only=True)

    class Meta:
        model = LeaveRequest
        fields = ['id', 'employee_name', 'employee_email', 'leave_type', 'start_date', 'end_date', 'status', 'reason', 'approved_by', 'created_at', 'replacements']
        read_only_fields = ['id', 'status', 'approved_by', 'created_at']


class HRContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = HRContract
        fields = [
            'id', 'employee_name', 'employee_email', 'contract_type',
            'position_title', 'salary_monthly', 'start_date', 'end_date',
            'status', 'vault_document', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
