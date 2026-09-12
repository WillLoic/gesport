import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_merchandising.settings')

def pytest_configure():
    django.setup()
