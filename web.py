from flask import Flask, render_template, request, jsonify, redirect, url_for

from flask_mysqldb import MySQL
from werkzeug.utils import secure_filename
import os
import numpy as np
import bcrypt
import time
import logging

from ai import face_processing
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

mysql = MySQL(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# List of routes to monitor
monitored_routes = ['/validate_image_wajah', '/validate_image_kelas', '/registerwajah', '/loginkelas']

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    # Check if the route is in the list of monitored routes
    if request.path in monitored_routes:
        elapsed_time = time.time() - request.start_time
        logger.info(f"Time taken for {request.path}: {elapsed_time:.4f} seconds")
    return response

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/register')
def register():
    user_agent = request.headers.get('User-Agent', '').lower()
    is_mobile = any(mobile in user_agent for mobile in ['iphone', 'android', 'blackberry', 'opera mini', 'windows mobile'])
    if is_mobile:
        return render_template('register.html', menu='register')
    else:
        return render_template('mobile-only.html')

@app.route("/registerwajah", methods=["POST", "GET"])
def registerwajah():
    if request.method == "POST":
        if 'gambarWajah' not in request.files:
            return jsonify({'success': False, 'message': 'No file part'}), 400
        
        email = request.form.get('email')
        nama = request.form.get('nama')
        nim = request.form.get('nim')
        prodi = request.form.get('prodi')
        angkatan = request.form.get('angkatan')
        file = request.files['gambarWajah']
        
        if not all([email, nama, nim, prodi, angkatan, file]):
            return jsonify({'success': False, 'message': 'Missing required data'}), 400
        
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT nim FROM students_registered WHERE nim = %s", (nim,))
            data_nim = cur.fetchone()
            cur.close()

            if data_nim:
                return jsonify({'success': False, 'message': 'nim already registered'}), 400
            if file.filename == '':
                return jsonify({'success': False, 'message': 'No selected file'}), 400

            if not allowed_file(file.filename):
                return jsonify({'success': False, 'message': 'Invalid file type'}), 400

            img_np = np.frombuffer(file.read(), np.uint8)
            face_verify = face_processing(img_np)

            if face_verify in ["More than 1 face detected", "there is no one face detected", "fake"]:
                return jsonify({'success': False, 'message': face_verify}), 400

            if face_verify == "you are not registered yet":
                filename = secure_filename(f"{nim}.jpg")
                try:
                    cur = mysql.connection.cursor()
                    cur.execute("INSERT INTO students_registered (email, name, nim, major, batch, file) VALUES (%s, %s, %s, %s, %s, %s)", 
                                (email, nama, nim, prodi, angkatan, filename))
                    mysql.connection.commit()
                    cur.close()

                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    with open(file_path, 'wb') as f:
                        f.write(img_np)

                    return jsonify({'success': True, 'message': 'successful', 'nim': nim})
                except Exception as e:
                    return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
            else:
                img_login = face_verify.split('\\')[1]
                try:
                    cur = mysql.connection.cursor()
                    cur.execute("SELECT nim FROM students_registered WHERE file = %s", (img_login,))
                    data = cur.fetchone()
                    cur.close()
                    if data:
                        return jsonify({'success': False, 'message': 'already registered', 'nim': data[0]}),400
                    else:
                        return jsonify({'success': False, 'message': 'Not found in database'}), 400
                except Exception as e:
                    return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        except:
            return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
            
    return render_template('register.html')

@app.route('/login')
def login():
    user_agent = request.headers.get('User-Agent', '').lower()
    is_mobile = any(mobile in user_agent for mobile in ['iphone', 'android', 'blackberry', 'opera mini', 'windows mobile'])
    if is_mobile:
        return render_template('login.html', menu='login')
    else:
        return render_template('mobile-only.html')

@app.route("/validate_token", methods=["POST"])
def validate_token():
    token = request.json.get("tokenKelas")
    if not token:
        return jsonify({'success': False, 'message': 'token kosong'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT token FROM data_token WHERE token = %s", (token,))
        data = cur.fetchone()
        cur.close()
        if data:
            return jsonify({"status": "valid", "token": token, "success": True, "message": "token valid"})
        else:
            return jsonify({"status": "invalid", "success": False, "message": "token tidak valid"}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

@app.route("/validate_image_wajah", methods=["POST"])
def validate_image_wajah():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': 'Invalid file type'}), 400
    
    img_np = np.frombuffer(file.read(), np.uint8)
    face_verify = face_processing(img_np)
    
    if face_verify in ["you are not registered yet", "More than 1 face detected", "there is no one face detected", "fake"]:
        return jsonify({'success': False, 'message': face_verify}), 400
    
    img_login = face_verify.split('\\')[1]
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT nim FROM students_registered WHERE file = %s", (img_login,))
        data = cur.fetchone()
        cur.close()
        if data:
            return jsonify({"status": "valid", 'success': True, 'message': 'Successful', 'nim': data[0]})
        else:
            return jsonify({"status": "invalid", 'success': False, 'message': 'Not registered in database'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500

# @app.route("/validate_image_kelas", methods=["POST"])
# def validate_image_kelas():
#     if 'file' not in request.files:
#         return jsonify({'success': False, 'message': 'No file part'}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'success': False, 'message': 'No selected file'}), 400

#     if not allowed_file(file.filename):
#         return jsonify({'success': False, 'message': 'Invalid file type'}), 400

#     try:
#         class_name, confidence_score = class_processing(file)
#         if class_name == "Classroom":
#             return jsonify({'success': True, 'message': 'Classroom', 'confidence': confidence_score})
#         elif class_name == "Not A Classroom":
#             return jsonify({'success': False, 'message': 'Not A Classroom', 'confidence': confidence_score})
#         else:
#             return jsonify({'success': False, 'message': 'Invalid class name'}), 400
#     except Exception as e:
#         return jsonify({'success': False, 'message': f'Processing error: {str(e)}'}), 500

@app.route("/loginkelas", methods=["POST", "GET"])
def login_kelas():
    if request.method == "POST":
        token = request.form.get('token')
        wajah = request.files.get('gambarWajah')
        kelas = request.files.get('gambarKelas')
        nim_login = request.form.get('nim')

        if not all([token, wajah, kelas, nim_login]):
            return jsonify({'success': False, 'message': 'Missing required data'}), 400

        if not (allowed_file(wajah.filename) and allowed_file(kelas.filename)):
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400

        try:
            filename_wajah = secure_filename(f"{token}_wajah_{nim_login}.jpg")
            filename_kelas = secure_filename(f"{token}_kelas_{nim_login}.jpg")

            wajah_path = os.path.join(app.config['UPLOAD_FOLDER_LOGIN'], filename_wajah)
            kelas_path = os.path.join(app.config['UPLOAD_FOLDER_LOGIN'], filename_kelas)

            with open(wajah_path, 'wb') as f_wajah, open(kelas_path, 'wb') as f_kelas:
                f_wajah.write(wajah.read())
                f_kelas.write(kelas.read())

            cur = mysql.connection.cursor()
            cur.execute("SELECT name From students_registered WHERE nim LIKE %s", 
                        (nim_login,))
            name = cur.fetchone()
            
            cur.execute("INSERT INTO students_login (nim, names, tokens, face_images, class_images) VALUES (%s, %s, %s, %s, %s)", 
                        (nim_login, name[0], token, filename_wajah, filename_kelas))
            mysql.connection.commit()
            cur.close()

            return jsonify({'status': 'valid', 'success': True, 'message': 'Successful', 'nim': nim_login, 'token': token, 'name': name[0]})
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

    return render_template('loginkelas.html')

@app.route('/table')
def table():
    return render_template('table.html',menu='table')

@app.route('/generatetable', methods=["POST", "GET"])
def generatetable():
    token = request.json.get("tokenKelas")

    if not token:
        return jsonify({'success': False, 'message': 'token kosong'}), 400
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM students_login WHERE tokens = %s", (token,))
        dataKehadiran = cur.fetchall()

        cur.execute("SELECT * FROM data_token WHERE token = %s", (token,))
        dataKelas = cur.fetchall()
        if not all([dataKehadiran, dataKelas]):
            return jsonify({"status": "invalid", "success": False, "message": "token tidak valid"})        
        return jsonify({"status": "valid", "dataKehadiran": dataKehadiran, "dataKelas": dataKelas, "success": True, "message": "token valid"}), 200
    except Exception as e:
        response = {'success': False, 'message': str(e)}
        return jsonify(response), 500

@app.route('/generate')
def generate():
    return render_template('generate.html',menu='generate')

@app.route("/generatetoken", methods=["POST", "GET"])
def generatetoken():
    email = request.form.get('email')
    nama = request.form.get('nama')
    inisial = request.form.get('inisial')
    nip = request.form.get('nip')
    matkul = request.form.get('matkul')
    pertemuan = request.form.get('pertemuan')
    tanggal = request.form.get('tanggal')
    waktu = request.form.get('waktu')
    deskripsi = request.form.get('deskripsi')
    password = request.form.get('password')
    token = request.form.get('token')
    
    if not all([email, nama, inisial, nip, matkul, pertemuan, tanggal, waktu, deskripsi, password, token]):
        return jsonify({'success': False, 'message': 'form kosong'}), 400 

    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT token From data_token WHERE token = %s", (token,))
        data = cur.fetchone()
        cur.close()
        if data and data[0] == token:
            return jsonify({'success': False, 'message': 'token is existing'}), 400
        else:
            try:
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur = mysql.connection.cursor()
                cur.execute("INSERT INTO data_token(email,name,initial,nip,subject,meeting,date,time,description,password,token) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (email,nama,inisial,nip,matkul,pertemuan,tanggal,waktu,deskripsi,hashed_password,token))
                mysql.connection.commit()
                cur.close()
                return jsonify({'success': True, 'message': 'successfull', 'token': token})
            except Exception as e: 
                return jsonify({'success': False, 'message': str(e)}), 500  
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/activate')
def activate():
    return render_template('activate.html',menu='activate')
@app.route('/activateQR', methods=["POST", "GET"])
def activateQR():
    password = request.form.get('password')
    token = request.form.get('token')

    if not all([token,password]):
        return jsonify({'success': False, 'message': 'tidak lengkap'}), 400
    
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT password FROM data_token WHERE token = %s ", (token,))
        data = cur.fetchone()
        cur.close()
        
        if data:
            stored_password = data[0]
            if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                return jsonify({'success': True, 'status': "valid", 'message': 'successfull', 'token': token})
            else:
                return jsonify({'success': False, 'message': 'Invalid token or password'}), 403
        else:
            return jsonify({'success': False, 'message': 'Invalid token'}), 403
            
    except Exception as e:
        response = {'success': False, 'message': str(e)}
        return jsonify(response), 500

@app.route('/update_qr', methods=['POST', 'GET'])
def update_qr():
    data = request.get_json()
    
    if not data or 'qr_code' not in data or 'token' not in data:
        return jsonify({"status": "error", "message": "Invalid data"}), 400

    current_qr_code = data['qr_code']
    token = data['token']

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE data_token
            SET qrs = %s
            WHERE token = %s
        """, (current_qr_code, token))
        mysql.connection.commit()
        cur.close()
        return jsonify({"status": "success"})
    except Exception as e:
        response = {'success': False, 'message': str(e)}
        return jsonify(response), 500
    
@app.route('/get_qr', methods=["POST", "GET"])
def get_qr():
    data = request.get_json()
    
    if not data or 'token' not in data:
        return jsonify({"status": "error", "message": "Invalid data"}), 400

    token = data['token']

    cur = mysql.connection.cursor()
    cur.execute("SELECT qrs FROM data_token WHERE token = %s", (token,))
    current_qr_code = cur.fetchone()
    cur.close()
    return jsonify({"status": "valid", "success": True, "current_qr_code": current_qr_code[0]})

@app.route('/tes', methods=["POST", "GET"])
def tes():
    return render_template('tes.html')

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
