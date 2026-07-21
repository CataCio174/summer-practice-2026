from Application import app
from flask import request, jsonify # type: ignore
from bson import ObjectId
from ..database.models import Device # Importăm modelul Device ca să putem salva în DB

@app.route('/schedule', methods=['POST'])
def set_schedule():
    try:
        schedule_data = request.get_json()
        device_id = schedule_data.get('deviceId')
        
        if not device_id:
            return jsonify({'error': 'Device ID lipsă'}), 400

        # 1. Căutăm dispozitivul în baza de date
        device = Device.objects(id=ObjectId(device_id)).first()
        
        if not device:
            return jsonify({'error': 'Device-ul nu a fost găsit'}), 404

        # 2. Salvăm efectiv programul (schedule) în documentul dispozitivului
        # Folosim set__schedule pentru a crea sau actualiza câmpul 'schedule' în MongoDB
        device.update(set__schedule=schedule_data)

        print(f"[*] Program salvat cu succes în DB pentru device-ul cu ID: {device_id}")

        return jsonify({
            'message': 'Programarea a fost salvată cu succes în baza de date!',
            'data': schedule_data
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400