from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PurchaseOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=50, unique=True)),
                ('supplier_name', models.CharField(max_length=255)),
                ('category', models.CharField(choices=[('Matériel Sportif', 'Matériel Sportif'), ('Textile & Flocage', 'Textile & Flocage'), ('Médical', 'Médical'), ('Alimentaire Buvette', 'Alimentaire Buvette'), ('Frais Transport', 'Frais Transport'), ('Autre', 'Autre')], default='Matériel Sportif', max_length=50)),
                ('description', models.TextField()),
                ('requested_by', models.CharField(max_length=255)),
                ('request_date', models.DateField(auto_now_add=True)),
                ('total_amount_ttc', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=10)),
                ('status', models.CharField(choices=[('En attente validation', 'En attente validation'), ('Validé', 'Validé'), ('Commandé', 'Commandé'), ('Livré', 'Livré'), ('Refusé', 'Refusé')], default='En attente validation', max_length=50)),
                ('invoice_attached', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
