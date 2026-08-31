from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academy.selectors.student_selector import list_academy_students
from apps.academy.serializers.student_serializer import AcademyStudentSerializer
from apps.academy.services.student_service import create_or_update_student

class AcademyStudentListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        students = list_academy_students(int(club_id))
        return Response(AcademyStudentSerializer(students, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = AcademyStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        member_id = data.pop('member').id
        student = create_or_update_student(member_id=member_id, **data)
        return Response(AcademyStudentSerializer(student).data, status=status.HTTP_201_CREATED)
