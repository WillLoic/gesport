from rest_framework import serializers
from apps.governance.models import GeneralAssembly, AssemblyConvocation, Resolution, AssemblyMinutes


class AssemblyConvocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssemblyConvocation
        fields = ['id', 'assembly', 'recipient_email', 'sent_at', 'is_acknowledged']
        read_only_fields = ['id', 'sent_at']


class ResolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resolution
        fields = ['id', 'assembly', 'title', 'description', 'votes_for', 'votes_against', 'votes_abstain', 'status']
        read_only_fields = ['id', 'status']


class AssemblyMinutesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssemblyMinutes
        fields = ['id', 'assembly', 'vault_document', 'content_summary', 'signed_pv_status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GeneralAssemblySerializer(serializers.ModelSerializer):
    convocations = AssemblyConvocationSerializer(many=True, read_only=True)
    resolutions = ResolutionSerializer(many=True, read_only=True)
    minutes = AssemblyMinutesSerializer(read_only=True)

    class Meta:
        model = GeneralAssembly
        fields = [
            'id', 'title', 'assembly_type', 'status', 'scheduled_at',
            'location', 'quorum_reached', 'created_at', 'updated_at',
            'convocations', 'resolutions', 'minutes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
