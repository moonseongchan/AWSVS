import numpy as np
import matplotlib.pyplot as plt
import csv
from scipy.signal import savgol_filter
from scipy import signal
from sklearn.decomposition import PCA
import pywt

#import matplotlib as mpl
#import json
#from scipy.io import loadmat
#from scipy.fft import ifft


## design params
Fs =499.2e6*2;
Ts = 1/Fs;
Timedelayidx = np.arange(0,512*Ts,Ts) #fixed 
c = 299792458; # speed of light in the air, m/sec

########################

def GetCirAmplitude(CIR):
    """
    #biref:  Get amplitude from Complex data
    #input: Complex data, its length 1016 or (512)
    #output: real data , its length depend on input's length
    """
    ##TODO normalized
    ret=abs(CIR)
    return ret

def GetCirPhase(CIR):
    """
    #biref:  Get phase from Complex data
    #input: Complex data, its length 1016 or (512)
    #output: real data , its length depend on input's length
    """
    ret=np.angle(CIR)
    return ret


def SGfiltering(CIR_amp,hyperparam1,hyperparam2):
    """
    #brief: CIR noise filtering via Savizy Golay filter 
    #args: real data (only avaialable for amplitude CIR), its length 1016
    #       hyperparam1: windowing param, should be hyperparam1 <  hyperparam2
    #       hyperparam2:polynomial degree
    #output: real data , its length depend on input's length
    """
    ret= savgol_filter(CIR_amp, hyperparam1, hyperparam2)
    return ret


def scale_to_frequency_CWT(scale):
    """
    Get frequency [Hz]
    """
    return 1.0 / scale



# def GetMeasurement_IQ(type):
#     if type == "Ipatov":
#         f = open("Ipatov_CIR.csv", "r")
#     elif type == "STS1":
#         f = open("STS1_CIR.csv", "r")
#     elif type == "STS2":
#         f = open("STS2_CIR.csv", "r")
#     else: 
#         print("unvailid type")
#         return
    
#     reader = csv.reader(f)

#     CIR_I = []
#     CIR_Q = []
#     for row in reader:
#         MeasCIR = row        
#         CIR_I.append(float(row[0]))
#         CIR_Q.append(float(row[1]))

#     CIR_I = np.array(CIR_I)
#     CIR_Q = np.array(CIR_Q)

#     CIR = CIR_I + 1j*CIR_Q # recover measured complex CIR   

#     CIR_abs   =  GetCirAmplitude(CIR)
#     CIR_Phase =  GetCirPhase(CIR)
    
#     return  CIR_abs,CIR_Phase

    
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
        return

    f = open(filename, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        MeasCIR = row        
        CIR.append(float(row[0]))
    CIR = np.array(CIR);
    return CIR

def RawCirPlot_DelayProfile(Timedelayidx,StackedCIR):
    ## Raw results
    for i in range(StackedCIR.shape[0]):
        plt.plot(Timedelayidx*1e9,StackedCIR[i,:])
    plt.xlabel('Time delay [nsec]')
    plt.ylabel('Digitalized amplitude [a.u.]')
    plt.xlim([0, 120])

    
def RawCirPlot_RangeProfile(Timedelayidx,StackedCIR):
     ## Raw results 
    for i in range(StackedCIR.shape[0]):
        plt.plot(Timedelayidx*c,StackedCIR[i,:])
    plt.xlabel('Range [m]')
    plt.ylabel('Digitalized amplitude [a.u.]')
    plt.xlim([0, 30])



    
def SGfilteringPlot(Timedelayidx,StackedCIR,hyperParam1=20,hyperParam2=11):
    
    CIR_ret = np.empty((StackedCIR.shape[0], StackedCIR.shape[1])) 
    for i in range(StackedCIR.shape[0]):
        result =  SGfiltering(StackedCIR[i],hyperParam1,hyperParam2)
        CIR_ret[i]  = result

    plt.figure(1)
    for i in range(StackedCIR.shape[0]):
        plt.plot(Timedelayidx*1e9,StackedCIR[i,:])
    plt.xlabel('Time delay [nsec]')
    plt.ylabel('Digitalized amplitude [a.u.]')
    plt.xlim([0, 120])

    plt.figure(2)
    for i in range(StackedCIR.shape[0]):
        plt.plot(Timedelayidx*1e9,CIR_ret[i,:])
    plt.xlim([0, 120])
    plt.xlabel('Time delay [nsec]')
    plt.ylabel('Digitalized amplitude [a.u.]')

    print("Size of SGfilter result is",np.shape(CIR_ret))
    return CIR_ret
    

    

def PcaPlot(Timedelayidx,StackedCir,NumPC=2):
    if NumPC > StackedCIR.shape[0]:
        print("Not support (yet)")
        NumPC=StackedCIR.shape[0]


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

    # vis
    plt.figure(figsize=(8, 6))
    plt.plot(Timedelayidx*1e9,projected_data.T)
    plt.title(f'PCA result - {num_principal_components} PCs')
    plt.xlabel('Time delay [nsec]')
    plt.ylabel('PC val [a. u.]')
    print("Size of PCA result is",np.shape(projected_data))
    return projected_data
    

def CwtPlot(Timedelayidx,StackedCIR,wavelet_name='cgau1',numScales=12,sampling_period=1e-9): #scaling = 32
    """
    args: Timedelayidx: TODO
          IpatovCirAmp,Sts1CirAmp,Sts2CirAmp: input data 
          wavelet_name: wavelet_function, available wavelet lists are ['cgau1','cmor', 'gaus1', 'mexh', 'morl','shan' ]
          
          
          numScales: The smaller this val, the better it can be helpful at detecting high frequency components of input data
          sampling_period: input data sampling freq., in this application, fixed

    outputs: (numScales, TypeofCIR, CirLength)
    """

    scales= np.arange(1, numScales+1)
    coeffs, freqs = pywt.cwt(StackedCIR, scales, wavelet=wavelet_name,sampling_period=sampling_period)

    plt.figure(figsize=(10, 2*StackedCIR.shape[0]))

    for i in range(StackedCIR.shape[0]):
        plt.subplot(StackedCIR.shape[0], 1, i + 1)
        
        plt.imshow(np.abs(coeffs[:, i, :]), extent=[0, StackedCIR.shape[1], freqs[-1]*1e-9, (freqs[0]+0.00000006)*1e-9], aspect='auto', cmap='jet')
        #print("max",(freqs[0]+0.00000006))
        plt.colorbar(label='Magnitude')
        plt.title(f'Channel {i + 1}')
        plt.xlabel('Time delay [nsec]')
        plt.ylabel('Frequency (GHz)')

    plt.tight_layout()
    plt.show()
    print("Size of CWT return reulst is",np.shape(coeffs))
    return coeffs, freqs


    

if __name__ == "__main__":
    # According to IEEE 802.15.4z, UWB Rx can be obtatin multiple CIRs from correlation result of Ipatov and STS(s), 
    # The number of STS(s) is depending on its segments (i.e., STS chuck(s))
    IpatovCirAmp = GetMeasurement_mag("Ipatov","NLOS") #mandatory
    Sts1CirAmp   = GetMeasurement_mag("STS1","NLOS")  #optional
    Sts2CirAmp   = GetMeasurement_mag("STS2","NLOS")  #optional

    IpatovCirAmp2 = GetMeasurement_mag("Ipatov","LOS") #mandatory
    Sts1CirAmp2   = GetMeasurement_mag("STS1","LOS")  #optional
    Sts2CirAmp2   = GetMeasurement_mag("STS2","LOS")  #optional


    
    #StackedCIR = np.vstack((IpatovCirAmp, Sts1CirAmp, Sts2CirAmp))
    StackedCIR = np.vstack((IpatovCirAmp, Sts1CirAmp, Sts2CirAmp, IpatovCirAmp2, Sts1CirAmp2, Sts2CirAmp2)) #debug
    
    


    


    #RawCirPlot_DelayProfile(Timedelayidx,StackedCIR)
    #RawCirPlot_RangeProfile(Timedelayidx,StackedCIR)
    #SGfilteringPlot(Timedelayidx,StackedCIR,30,11)
    #PcaPlot(Timedelayidx,StackedCIR,5)
    CwtPlot(Timedelayidx,StackedCIR,'cgau1',12,1e-9)
    plt.show()
    
    

    
##############

# TODO  save from results data to json format
# data = {
#     "CIR" : {
#         "CIR_I": [],
#         "CIR_Q": [],
#         "result": []   
#     }
# }    
# file_path = "./test.json"
# with open(file_path, 'w', encoding='utf-8') as file: 
#     json.dump(data, file)