
import tensorflow as tf

# Check if TensorFlow is built with CUDA (GPU) support
print("Built with CUDA:", tf.test.is_built_with_cuda())

# Check GPU availability
gpus = tf.config.list_physical_devices('GPU')
print("GPUs available:", gpus)

# Mengatur GPU yang ingin digunakan (jika ada lebih dari satu GPU)
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        # Mengatur agar TensorFlow hanya menggunakan GPU pertama
        tf.config.set_visible_devices(gpus[0], 'GPU')

        # Mengatur penggunaan memori agar tidak penuh di awal (opsional)
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

# Verifikasi apakah GPU telah diatur dengan benar
logical_gpus = tf.config.experimental.list_logical_devices('GPU')
print(len(gpus), "Physical GPUs,", len(logical_gpus), "Logical GPUs")

import tensorflow as tf

# Membuat tensor dan operasi sederhana
a = tf.constant([1.0, 2.0, 3.0], shape=[3], name='a')
b = tf.constant([1.0, 2.0, 3.0], shape=[3], name='b')
c = a + b

print(c)



import torch
print(torch.cuda.is_available())
