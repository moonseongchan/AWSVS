import numpy as np
import csv
from scipy.signal import savgol_filter
from scipy import signal
from sklearn.decomposition import PCA
from pywt import cwt
import sys
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os


####################### debug flag #######################
plot_flag = 0; #if standalone python 
debug_flag = 0;
##########################################################


################## fixed design params ##################
Fs =499.2e6*2;
Ts = 1/Fs;
Timedelayidx = np.arange(0,512*Ts,Ts); 
c = 299792458; # speed of light in the air, m/sec
ParseError = -1;
CIR=[] #global data
##########################################################


app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app, resources={r'*': {'origins': 'http://localhost:3000'}}, supports_credentials=True)

# Write your own data file path
path = "C:/Users/ASUS/Desktop/InfoVis/Project/awsvs/src/data/"
# path = "/Users/hslee/Desktop/GitMUC/Test/AWSVS/src/data"

# Import Data => Python => Import Data
@app.route('/upload', methods=['POST'])
def uploadFile():
    file = request.files['file']
    
    fileName = secure_filename(file.filename)
    filePath = os.path.join(path, fileName)
    file.save(filePath)
    # print(filePath)

    # 임시 방편
    f = open(filePath, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        CIR.append(float(row[0]))
    # print(CIR)

    return jsonify({'result': [CIR]})


def temp_Get_Data():
    GlobalCIR = CIR
    if len(CIR) == 0:
        return GetMeasurement_mag(type="Ipatov",env="NLOS") #only test
    else:
        return CIR

#send
@app.route('/get', methods=['POST'])
def get_data():
    data = np.array(json.loads(request.form['data']))
    processInfo = json.loads(request.form['processing'])

    # Determine Processing Method
    resultData=[]
    isSG = processInfo['applySD']
    isCWT = processInfo['applyCWT']
    isSTFT = processInfo['applySTFT']

    if len(data) > 100: # if 1D array
        data = data.reshape((1, -1)) 

    print()
    print("- " * 30, end="\n")
    if not isSG and not isCWT and not isSTFT:
        print("< Raw >")
        resultData = data
        print("Size of raw result is",np.shape(data))
    elif not isCWT and not isSTFT and isSG:
        print("< Only SD >")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        resultData = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
    elif not isSG and not isSTFT and isCWT:
        print("< Only CWT >")
        Wavelet = processInfo['wavelet']
        Scale = processInfo['scale']
        resultData, _ = CwtPlot(Timedelayidx,data,Wavelet,Scale)
        resultData = np.squeeze(abs(resultData), axis=1)
        print("spectogram dimension is")
        print("Size of CWT return reulst is",np.shape(resultData))
    elif not isSG and not isCWT and isSTFT:
        print("< Raw & STFT => Raw >")
        resultData = data
        print("Size of raw result is",np.shape(data))
    elif not isSTFT and isSG and isCWT:
        print("< SD & CWT >")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        fromSG = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
        Wavelet = processInfo['wavelet']
        Scale = processInfo['scale']
        resultData, _ = CwtPlot(Timedelayidx,fromSG,Wavelet,Scale)
        resultData = np.squeeze(abs(resultData), axis=1)
        print("spectogram dimension is")
        print("Size of CWT return reulst is",np.shape(resultData))
    elif not isCWT and isSG and isSTFT:
        print("< SD & STFT => SD >")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        resultData = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)

    # Check Values
    print("applySD :", processInfo['applySD'])
    print("window :", processInfo['window'])
    print("degreeOfPolynomial :", processInfo['degreeOfPolynomial'])
    print("applyCWT :", processInfo['applyCWT'])
    print("wavelet :", processInfo['wavelet'])
    print("scale :", processInfo['scale'])
    print("applySTFT :", processInfo['applySTFT'])
    print()

    result = resultData.tolist()
    return jsonify({'result': result})


@app.route('/stft', methods=['POST'])
def get_stft():
    data = np.array(json.loads(request.form['data']))
    processInfo = json.loads(request.form['processing'])
    time = json.loads(request.form['time'])
    
    # print()
    # print(data)
    # print("- " * 12, "STFT", " -" * 12)
    # print("applySD :", processInfo['applySD'])
    # print("window :", processInfo['window'])
    # print("degreeOfPolynomial :", processInfo['degreeOfPolynomial'])
    # print("applySTFT :", processInfo['applySTFT'])
    # print("start :", time['start'])
    # print("end :", time['end'])

    # Determine Processing Method
    isSG = processInfo['applySD']
    isCWT = processInfo['applyCWT']
    isSTFT = processInfo['applySTFT']

    if len(data) > 100: # if 1D array
        data = data.reshape((1, -1)) 

    if not isSG and not isCWT and isSTFT:
        # print("< Raw & STFT >")
        [timeDomain, freqDomain] = WindowingFT(data, time['start'], time['end'])
    elif not isCWT and isSTFT:
        # print("< SD & STFT >")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        fromSG = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
        [timeDomain, freqDomain] = WindowingFT(fromSG, time['start'], time['end'])

    ###### TODO ######
    # example
    #[windowed_timedomain_signal,FT_result]=WindowingFT(denoisedSignalviaFilter,100,512) 
    ###### TODO end ######

    # print("STFT X :", timeDomain)
    # print("STFT Y :", freqDomain)
    
    # result = resultData.tolist()
    # return jsonify({'result': result})
    return jsonify({'result': "temp"})

def GetCirAmplitude(CIR):
    """
    #biref:  Get amplitude from Complex data
    #input: Complex data, its length 1016 or (512)
    #output: real data , its length depend on input's length
    """
    ##TODO normalized?
    ret=abs(CIR)
    return ret


def SGfiltering(CIR_amp,hyperparam1,hyperparam2):
    """
    #brief: CIR noise filtering via Savizy Golay filter 
    #args: real data (only avaialable for amplitude CIR), its length 1016
    #       hyperparam1: windowing param, should be hyperparam1 < hyperparam2 ??? , hyperparam1 > hyperparam2
    #       hyperparam2:polynomial degree
    #output: real data , its length depend on input's length
    """
    ret = savgol_filter(CIR_amp, hyperparam1, hyperparam2)
    return ret



def scale_to_frequency_CWT(scale):
    """
    Get frequency [Hz]
    """
    return 1.0 / scale
    


def GetMeasurement_mag(type="Ipatov",env="NLOS"):
    """
    parser, TODO consider I/Q meas.
    args: 
          type: type of CIR [Ipatov,STS1,STS2]
          env: LOS and NLOS (identify data collected in diff. environments)
    """
    filename=[]
    if env == "LOS":
        filename = "LOS/";
    elif env == "NLOS":
        filename = "NLOS/"
    else:
        pass #//TODO

    if type == "Ipatov":
        filename = filename+"Ipatov_CIR.csv"
    elif type == "STS1":
        filename = filename+"STS1_CIR.csv"
    elif type == "STS2":
        filename = filename+"STS2_CIR.csv"
    else: 
        print("Error:: unvailid type")
        return -1

    f = open(filename, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        MeasCIR = row        
        CIR.append(float(row[0]))
    CIR = np.array(CIR)
    return CIR

    
def SGfilteringPlot(Timedelayidx,StackedCIR,hyperParam1=20,hyperParam2=11):
    CIR_ret = np.empty((StackedCIR.shape[0], StackedCIR.shape[1]))
    for i in range(StackedCIR.shape[0]):
        print(len(StackedCIR[i]))
        result =  SGfiltering(StackedCIR[i],hyperParam1,hyperParam2)
        CIR_ret[i]  = result
    print("Size of SGfilter result is",np.shape(CIR_ret))
    return CIR_ret
    

    

def PcaPlot(Timedelayidx,StackedCir,NumPC=2):
    if NumPC > StackedCir.shape[0]:
        print("Not support (yet)")
        NumPC=StackedCir.shape[0]


    mean_centered_data = StackedCir - np.mean(StackedCir, axis=1)[:, np.newaxis] # subtract mean
    cov_matrix = np.cov(mean_centered_data)
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)

    # Sort eigenvalue(s) ​​in descending order
    sorted_indices = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[sorted_indices]
    eigenvectors = eigenvectors[:, sorted_indices]

    # select PCs
    num_principal_components = NumPC   #   1~  # of features
    principal_components = eigenvectors[:, :num_principal_components]

    # prjoection
    projected_data = np.dot(principal_components.T, mean_centered_data)

    return projected_data
    

def CwtPlot(Timedelayidx,StackedCIR,wavelet_name='cgau1',numScales=12): #scaling = 32
    """
    args: Timedelayidx: TODO
          IpatovCirAmp,Sts1CirAmp,Sts2CirAmp: input data 

          wavelet_name: wavelet_function, available wavelet lists are ['cgau1','cmor', 'gaus1', 'mexh', 'morl','shan' ]
          numScales: The smaller this val, the better it can be helpful at detecting high frequency components of input data
          
    outputs: coeffs = (numScales, TypeofCIR, CirLength), freqs: y-axis scale
    """
    sampling_period = 1e-9 #fixed
    scales= np.arange(1, numScales+1)
    coeffs, freqs = cwt(StackedCIR, scales, wavelet=wavelet_name,sampling_period=sampling_period)
    return coeffs, freqs

def WindowingFT(data,startIdx,endIdx):
    """
    input ::
        data: UWB data
        startIdx: start windowing index, in out app, [0,512] (integer)
        endIdx: start windowing index, endIdx> startIdx (integer)
    return ::
        intervaled_signal: windowing UWB data
        abs(fft): fourier transfrom result
    """
    intervaled_signal = data[0, startIdx:endIdx]  
    num_samples = len(intervaled_signal)
    # print("Debug:: widnow size is", num_samples)
    fft = np.fft.fft(intervaled_signal) / num_samples #num_samples is normalizer
    #scaleY=  abs(fft[0])/2
    fft[0] = 0 #dc offset compenstation
    fft = np.fft.fftshift(fft) #align for 0Hz 

    return intervaled_signal,abs(fft)  #time domain(only windowed), freq domian

if __name__ == '__main__':
    app.run(debug=True, port=5000)