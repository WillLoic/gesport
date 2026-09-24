from rest_framework import serializers
from apps.academy.models.student import AcademyStudent
from apps.membres.models.member import Member
from apps.membres.serializers.member_serializer import MemberSerializer

class AcademyStudentSerializer(serializers.ModelSerializer):
    member_detail = MemberSerializer(source='member', read_only=True)
    member = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all(), required=False, allow_null=True)
    member_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = AcademyStudent
        fields = [
            'id', 'member', 'member_id', 'member_detail', 'school_name', 'grade_level',
            'academic_gpa', 'age', 'parents_name', 'tutor_name', 'tutor_phone',
            'school_support_needed', 'observations', 'created_at',
        ]

