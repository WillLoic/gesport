from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.academy.models.student import AcademyStudent
from apps.academy.selectors.student_selector import list_academy_students
from apps.academy.serializers.student_serializer import AcademyStudentSerializer
from apps.academy.services.student_service import create_or_update_student, delete_student

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
        
        member_obj = data.pop('member', None)
        member_id = data.pop('member_id', None)
        if member_obj:
            member_id = member_obj.id

        student = create_or_update_student(member_id=member_id, **data)
        return Response(AcademyStudentSerializer(student).data, status=status.HTTP_201_CREATED)

class AcademyStudentDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            student = AcademyStudent.objects.select_related('member').get(pk=pk)
            return Response(AcademyStudentSerializer(student).data)
        except AcademyStudent.DoesNotExist:
            return Response({'detail': 'Élève non trouvé.'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request: Request, pk: int) -> Response:
        serializer = AcademyStudentSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        member_obj = data.pop('member', None)
        member_id = data.pop('member_id', None)
        if member_obj:
            member_id = member_obj.id

        student = create_or_update_student(student_id=pk, member_id=member_id, **data)
        return Response(AcademyStudentSerializer(student).data)

    def patch(self, request: Request, pk: int) -> Response:
        return self.put(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        delete_student(student_id=pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

