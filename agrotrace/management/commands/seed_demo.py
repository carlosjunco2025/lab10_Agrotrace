"""Datos de demostración para probar la API REST de la Semana 12.

Uso:
    python manage.py seed_demo
    python manage.py seed_demo --reset   # borra lotes y fundos antes de sembrar
"""

from decimal import Decimal

from django.core.management.base import BaseCommand

from agrotrace.models import FundoProductor, LoteRecepcionado

FUNDOS = [
    {
        'nombre_fundo': 'Fundo Santa Elena',
        'propietario_dni_ruc': '20481234567',
        'hectareas': Decimal('48.50'),
        'valido_exportacion': True,
        'cupo_diario_lotes': 12,
    },
    {
        'nombre_fundo': 'Fundo Valle Verde',
        'propietario_dni_ruc': '45872136',
        'hectareas': Decimal('32.00'),
        'valido_exportacion': False,
        'cupo_diario_lotes': 3,
    },
    {
        'nombre_fundo': 'Fundo Los Olivos',
        'propietario_dni_ruc': '20567891234',
        'hectareas': Decimal('65.75'),
        'valido_exportacion': True,
        'cupo_diario_lotes': 8,
    },
    {
        'nombre_fundo': 'Fundo La Esperanza',
        'propietario_dni_ruc': '20601234567',
        'hectareas': Decimal('24.00'),
        'valido_exportacion': True,
        'cupo_diario_lotes': 6,
    },
]

LOTES = [
    ('LOT-2026-001', '12.50', '1.20', 'PENDIENTE', 'Fundo Santa Elena'),
    ('LOT-2026-002', '8.75', '2.40', 'EN_PROCESO', 'Fundo Santa Elena'),
    ('LOT-2026-003', '15.00', '0.80', 'PROCESADO', 'Fundo Valle Verde'),
    ('LOT-2026-004', '6.25', '3.10', 'PENDIENTE', 'Fundo Los Olivos'),
    ('LOT-2026-005', '22.40', '1.75', 'PROCESADO', 'Fundo La Esperanza'),
    ('LOT-2026-006', '9.80', '0.00', 'EN_PROCESO', 'Fundo Los Olivos'),
]


class Command(BaseCommand):
    help = 'Crea fundos y lotes de demostración para probar el panel.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina los lotes y fundos existentes antes de sembrar.',
        )

    def handle(self, *args, **options):
        if options['reset']:
            LoteRecepcionado.objects.all().delete()
            FundoProductor.objects.all().delete()
            self.stdout.write('Registros anteriores eliminados.')

        fundos = {}
        for datos in FUNDOS:
            fundo, creado = FundoProductor.objects.get_or_create(
                nombre_fundo=datos['nombre_fundo'],
                defaults=datos,
            )
            fundos[datos['nombre_fundo']] = fundo
            if creado:
                self.stdout.write(f'Fundo creado: {fundo.nombre_fundo}')

        for codigo, toneladas, descarte, estado, fundo in LOTES:
            _, creado = LoteRecepcionado.objects.get_or_create(
                codigo_lote=codigo,
                defaults={
                    'toneladas_brutas': Decimal(toneladas),
                    'porcentaje_descarte': Decimal(descarte),
                    'estado_evaluacion': estado,
                    'fundo': fundos[fundo],
                },
            )
            if creado:
                self.stdout.write(f'Lote creado: {codigo}')

        self.stdout.write(
            self.style.SUCCESS(
                'Datos listos: '
                f'{FundoProductor.objects.count()} fundos y '
                f'{LoteRecepcionado.objects.count()} lotes.'
            )
        )
