import cv2
from deepface import DeepFace
# import tensorflow as tf

# # Mengatur GPU yang ingin digunakan (jika ada lebih dari satu GPU)
# gpus = tf.config.list_physical_devices('GPU')
# if gpus:
#     try:
#         # Mengatur agar TensorFlow hanya menggunakan GPU pertama
#         tf.config.set_visible_devices(gpus[0], 'GPU')

#         # Mengatur penggunaan memori agar tidak penuh di awal (opsional)
#         for gpu in gpus:
#             tf.config.experimental.set_memory_growth(gpu, True)
#     except RuntimeError as e:
#         print(e)

# # Verifikasi apakah GPU telah diatur dengan benar
# logical_gpus = tf.config.experimental.list_logical_devices('GPU')
# print(len(gpus), "Physical GPUs,", len(logical_gpus), "Logical GPUs")



def face_processing(img_cv):
    try:
        image = cv2.imdecode(img_cv, cv2.IMREAD_COLOR)
        folder_img = "static/upload/img_register"

        img = DeepFace.extract_faces(img_path=image, detector_backend = "retinaface", anti_spoofing = True)
        if len(img) > 1:
            return "More than 1 face detected"
        elif len(img) == 1:
            for i in img:
                is_real = i['is_real']
                if is_real:
                    try:
                        dfs = DeepFace.find(img_path=image, db_path=folder_img, model_name = "Facenet512",)
                        # Mengakses DataFrame pada indeks 0 dari list_of_dfs
                        df_at_index_0 = dfs[0]
                        # Temukan nilai minimum dari kolom 'distance' dalam DataFrame pada indeks 0
                        min_distance = df_at_index_0['distance'].min()
                        # Temukan baris dengan nilai minimum dalam kolom 'distance'
                        row_with_min_distance = df_at_index_0.loc[df_at_index_0['distance'] == min_distance]
                        # Ambil nilai dari kolom 'identity' pada baris tersebut
                        identity_of_min_distance = row_with_min_distance['identity'].values[0]
                        return identity_of_min_distance
                    except:
                        return "you are not registered yet"
                else:
                    return "fake"
    except:
        return "there is no one face detected"
    

# def class_processing(image_path):
#     model_path = 'keras_model.h5'
#     labels_path ='labels.txt'
#     np.set_printoptions(suppress=True)

#     # Load the model
#     model = load_model(model_path, compile=False)

#     # Load the labels
#     class_names = open(labels_path, "r").readlines()

#     # Create the array of the right shape to feed into the keras model
#     data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

#     # Load and process the image
#     image = Image.open(image_path).convert("RGB")

#     # Resize the image to be at least 224x224 and then crop from the center
#     size = (224, 224)
#     image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)

#     # Turn the image into a numpy array
#     image_array = np.asarray(image)

#     # Normalize the image
#     normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1

#     # Load the image into the array
#     data[0] = normalized_image_array

#     # Predicts the model
#     prediction = model.predict(data)
#     index = np.argmax(prediction)
#     class_name = class_names[index].strip()
#     confidence_score = prediction[0][index] * 100
#     class_name = class_name[2:] 
#     confidence_score = round(confidence_score, 2)
#     # print(class_name)
#     # print(confidence_score)

#     return class_name, confidence_score

