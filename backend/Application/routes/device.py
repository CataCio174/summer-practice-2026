from Application import app
from flask import jsonify, request # type: ignore
from ..database.models import Device
from bson import ObjectId

@app.route('/devices', methods=['GET'])
def get_devices():
    try:
        devices = Device.objects().to_json()
        return devices, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/device', methods=['POST'])
def add_device():
    try:
        device_data = request.get_json()
        new_device = Device(**device_data)
        new_device.save()
        return jsonify({'message': 'Device added successfully'}), 201
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400

@app.route('/device/<_id>', methods=['PUT', 'DELETE'])
def manage_device(_id):
    if request.method == 'PUT':
        try:
            device_data = request.get_json()
            device_data.pop('_id', None)
            deviceToUpdate = Device.objects(id=ObjectId(_id))
            if deviceToUpdate:
                deviceToUpdate.update(**device_data)
                return jsonify({'message': 'Device updated successfully'}), 200
            else:
                return jsonify({'error': 'Device not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}), 400

    elif request.method == 'DELETE':
        try:
            deviceToDelete = Device.objects(id=ObjectId(_id))
            if deviceToDelete:
                deviceToDelete.delete()
                return jsonify({'message': 'Device deleted successfully'}), 200
            else:
                return jsonify({'error': 'Device not found'}), 404
        except Exception as e:
            print(e)
            return jsonify({'error': str(e)}), 400

@app.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    try:
        devices = Device.objects()
        total_devices = devices.count()
        
        days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
        weekly_power_usage = []
        
        total_power_week = 0
        total_saved_week = 0
        
        POWER_PER_HOUR = 0.2 
        
        for day in days:
            daily_usage = 0
            daily_saved = 0
            
            for device in devices:
                schedule = getattr(device, 'schedule', {}) 
                
                if not schedule:
                    always_on = True
                    active_days = days
                else:
                    always_on = schedule.get('alwaysOn', True)
                    active_days = schedule.get('activeDays', days)
                    on_time_str = schedule.get('onTime', '00:00')
                    off_time_str = schedule.get('offTime', '23:59')

                if always_on:
                    daily_usage += 24 * POWER_PER_HOUR
                elif day not in active_days:
                    daily_saved += 24 * POWER_PER_HOUR
                else:
                    try:
                        on_h, on_m = map(int, on_time_str.split(':'))
                        off_h, off_m = map(int, off_time_str.split(':'))
                        
                        active_hours = (off_h + off_m/60.0) - (on_h + on_m/60.0)
                        if active_hours < 0: 
                            active_hours += 24 
                            
                        saved_hours = 24 - active_hours
                        
                        daily_usage += active_hours * POWER_PER_HOUR
                        daily_saved += saved_hours * POWER_PER_HOUR
                    except:
                        daily_usage += 24 * POWER_PER_HOUR
            
            total_power_week += daily_usage
            total_saved_week += daily_saved
            
            weekly_power_usage.append({
                "day": day.capitalize(), 
                "usage": round(daily_usage, 1),
                "saved": round(daily_saved, 1)
            })

        return jsonify({
            "totalDevices": total_devices,
            "totalPower": round(total_power_week, 1),
            "energySaved": round(total_saved_week, 1),
            "chartData": weekly_power_usage
        }), 200
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

# --- RUTA NOUĂ PENTRU SCHEDULE ---
@app.route('/schedule', methods=['POST'])
def set_schedule():
    try:
        schedule_data = request.get_json()
        device_id = schedule_data.get('deviceId')
        
        if not device_id:
            return jsonify({'error': 'Device ID lipsă'}), 400

        # Căutăm dispozitivul în baza de date
        device = Device.objects(id=ObjectId(device_id)).first()
        
        if not device:
            return jsonify({'error': 'Device-ul nu a fost găsit'}), 404

        # Salvăm programul în documentul dispozitivului
        device.update(set__schedule=schedule_data)

        print(f"[*] Program salvat cu succes în DB pentru device-ul cu ID: {device_id}")

        return jsonify({
            'message': 'Programarea a fost salvată cu succes în baza de date!',
            'data': schedule_data
        }), 200

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 400